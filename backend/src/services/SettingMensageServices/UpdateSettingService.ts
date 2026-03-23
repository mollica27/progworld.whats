import AppError from "../../errors/AppError";
import SettingMessage from "../../models/SettingMessage";

interface Request {
  whatsappId: number;
  data: any;
}

const UpdateSettingService = async ({
  whatsappId,
  data
}: Request): Promise<SettingMessage | undefined> => {
  const setting = await SettingMessage.findOne({
    where: { whatsappId }
  });

  if (!setting) {
    throw new AppError("ERR_NO_SETTING_FOUND", 404);
  }

  await setting.update(data);

  return setting;
};

export default UpdateSettingService;
