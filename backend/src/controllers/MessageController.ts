import { Request, Response } from "express";

import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import { getIO } from "../libs/socket";
import Message from "../models/Message";

import ListMessagesService from "../services/MessageServices/ListMessagesService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import DeleteWhatsAppMessage from "../services/WbotServices/DeleteWhatsAppMessage";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";

import sendFaceMedia from "../services/FacebookServices/sendFacebookMessageMedia";
import sendFaceMessage from "../services/FacebookServices/sendFacebookMessage";

type IndexQuery = {
  pageNumber: string;
};

type MessageData = {
  body: string;
  fromMe: boolean;
  read: boolean;
  quotedMsg?: Message;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { pageNumber } = req.query as IndexQuery;

  const { count, messages, ticket, hasMore } = await ListMessagesService({
    pageNumber,
    ticketId
  });

  SetTicketMessagesAsRead(ticket);

  return res.json({ count, messages, ticket, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { body, quotedMsg }: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];

  const ticket = await ShowTicketService(ticketId);

  SetTicketMessagesAsRead(ticket);

  const io = getIO();

  if (medias) {
    await Promise.all(
      medias.map(async (media: Express.Multer.File) => {
        if (ticket.channel === "whatsapp") {
          const sentMedia = await SendWhatsAppMedia({ media, ticket });
          
          const newMessage = await Message.create({
            id: sentMedia.key.id,
            ticketId: ticket.id,
            contactId: ticket.contactId,
            body: media.originalname,
            fromMe: true,
            read: true,
            mediaType: media.mimetype ? media.mimetype.split("/")[0] : "image",
            mediaUrl: media.filename,
            ack: 1,
            dataJson: JSON.stringify(sentMedia)
          });

          io.to(ticketId.toString())
            .to(ticket.status)
            .to("notification")
            .emit("appMessage", {
              action: "create",
              message: newMessage,
              ticket: ticket,
              contact: ticket.contact
            });
        }

        if (ticket.channel === "facebook" || ticket.channel === "instagram") {
          await sendFaceMedia({ media, ticket });
        }
      })
    );
  } else {
    if (ticket.channel === "whatsapp") {
      const sentMessage = await SendWhatsAppMessage({ body, ticket, quotedMsg });
      
      const newMessage = await Message.create({
        id: sentMessage.key.id,
        ticketId: ticket.id,
        contactId: ticket.contactId,
        body,
        fromMe: true,
        read: true,
        mediaType: "chat",
        ack: 1,
        dataJson: JSON.stringify(sentMessage)
      });

      io.to(ticketId.toString())
        .to(ticket.status)
        .to("notification")
        .emit("appMessage", {
          action: "create",
          message: newMessage,
          ticket: ticket,
          contact: ticket.contact
        });
    }

    if (ticket.channel === "facebook" || ticket.channel === "instagram") {
      await sendFaceMessage({ body, ticket, quotedMsg });
    }
  }

  return res.send();
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;

  const message = await DeleteWhatsAppMessage(messageId);

  const io = getIO();
  io.to(message.ticketId.toString()).emit("appMessage", {
    action: "update",
    message
  });

  return res.send();
};
