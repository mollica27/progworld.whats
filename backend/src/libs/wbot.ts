import makeWASocket, {
  AuthenticationState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  WASocket,
  makeInMemoryStore,
  proto // Import proto
} from "@whiskeysockets/baileys";

import { Boom } from "@hapi/boom";
import * as Sentry from "@sentry/node"; // Importar Sentry corretamente

import MAIN_LOGGER from "@whiskeysockets/baileys/lib/Utils/logger";
import NodeCache from "node-cache";
import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";
import { getIO } from "./socket";
import { Store } from "./store";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import DeleteBaileysService from "../services/BaileysServices/DeleteBaileysService";
import { useMultiFileAuthState } from "../helpers/useMultiFileAuthState";
import BaileysSessions from "../models/BaileysSessions";

const msgRetryCounterCache = new NodeCache();

const loggerBaileys = MAIN_LOGGER.child({});
loggerBaileys.level = "silent";

type Session = WASocket & {
  id?: number;
  store?: Store;
};

const sessions: Session[] = [];

const retriesQrCodeMap = new Map<number, number>();

export const getWbot = (whatsappId: number): Session => {
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);

  if (sessionIndex === -1) {
    throw new AppError("ERR_WAPP_NOT_INITIALIZED");
  }
  return sessions[sessionIndex];
};

export const removeWbot = async (
  whatsappId: number,
  isLogout = true
): Promise<void> => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
    if (sessionIndex !== -1) {
      if (isLogout) {
        sessions[sessionIndex].logout();
        sessions[sessionIndex].ws.close();
      }

      sessions.splice(sessionIndex, 1);
    }
  } catch (err) {
    logger.error(err);
  }
};

export const initWbot = async (whatsapp: Whatsapp): Promise<Session> => {
  return new Promise(async (resolve, reject) => {
    try {
      const io = getIO();

      const whatsappUpdate = await Whatsapp.findOne({
        where: { id: whatsapp.id }
      });

      if (!whatsappUpdate) {
        return reject(new AppError("ERR_WAPP_NOT_FOUND"));
      }

      const { id, name, isMultidevice } = whatsappUpdate;
      const { isLatest, version } = await fetchLatestBaileysVersion();

      logger.info(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
      logger.info(`isMultidevice: ${isMultidevice}`);
      logger.info(`Starting session ${name}`);
      let retriesQrCode = 0;

      let wsocket: Session = null;
      const { state, saveCreds } = await useMultiFileAuthState(whatsapp);

      const store = makeInMemoryStore({ logger: loggerBaileys });

      wsocket = makeWASocket({
        logger: loggerBaileys,
        printQRInTerminal: false,
        auth: state,
        version,
        msgRetryCounterCache,
        getMessage: async key => {
          if (store) {
            const msg = await store.loadMessage(key.remoteJid!, key.id!);
            return msg?.message || undefined;
          }
          return undefined;
        }
      });

      store.bind(wsocket.ev);
      wsocket.store = store;
      wsocket.ev.on("creds.update", saveCreds);

      wsocket.ev.on(
        "connection.update",
        async ({ connection, lastDisconnect, qr }) => {
          logger.info(
            `Socket  ${name} Connection Update ${connection || ""} ${
              lastDisconnect || ""
            }`
          );

          const disconect = (lastDisconnect?.error as Boom)?.output
            ?.statusCode;

          if (connection === "close") {
            if (disconect === 403 || disconect === DisconnectReason.loggedOut) {
              await whatsapp.update({
                status: "PENDING",
                session: ""
              });
              await DeleteBaileysService(whatsapp.id);

              await BaileysSessions.destroy({
                where: {
                  whatsappId: whatsapp.id
                }
              });

              io.emit("whatsappSession", {
                action: "update",
                session: whatsapp
              });
              removeWbot(id, false);
              setTimeout(() => StartWhatsAppSession(whatsapp), 2000);
            } else {
              removeWbot(id, false);
              setTimeout(() => StartWhatsAppSession(whatsapp), 2000);
            }
          }

          if (connection === "open") {
            await whatsapp.update({
              status: "CONNECTED",
              qrcode: "",
              retries: 0
            });

            io.emit("whatsappSession", {
              action: "update",
              session: whatsapp
            });

            const sessionIndex = sessions.findIndex(
              s => s.id === whatsapp.id
            );
            if (sessionIndex === -1) {
              wsocket.id = whatsapp.id;
              sessions.push(wsocket);
            }

            resolve(wsocket);
          }

          if (qr !== undefined) {
            if (retriesQrCodeMap.get(id) && retriesQrCodeMap.get(id) >= 3) {
              await whatsappUpdate.update({
                status: "DISCONNECTED",
                qrcode: ""
              });
              await DeleteBaileysService(whatsappUpdate.id);
              await BaileysSessions.destroy({
                where: {
                  whatsappId: whatsapp.id
                }
              });
              io.emit("whatsappSession", {
                action: "update",
                session: whatsappUpdate
              });
              wsocket.ev.removeAllListeners("connection.update");
              wsocket.ws.close();
              wsocket = null;
              retriesQrCodeMap.delete(id);
            } else {
              logger.info(`Session QRCode Generate ${name}`);
              retriesQrCodeMap.set(id, (retriesQrCode += 1));

              await whatsapp.update({
                qrcode: qr,
                status: "qrcode",
                retries: 0
              });
              const sessionIndex = sessions.findIndex(
                s => s.id === whatsapp.id
              );

              if (sessionIndex === -1) {
                wsocket.id = whatsapp.id;
                sessions.push(wsocket);
              }

              io.emit("whatsappSession", {
                action: "update",
                session: whatsapp
              });
            }
          }
        }
      );
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      logger.error(error);
      reject(error);
    }
  });
};
