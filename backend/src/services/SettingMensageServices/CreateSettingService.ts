import SettingMessage from "../../models/SettingMessage";

interface Request {
  contacts: boolean;
  limit: number;
  minutes: number;
  photo: boolean;
  random: boolean;
  seconds: number;
  whatsappId: number;
  status: string;
}

const CreateSettingService = async (
  settingsData: any
): Promise<SettingMessage | undefined | null> => {
  const checkExist = await SettingMessage.findOne({
    where: {
      whatsappId: settingsData.whatsappId
    }
  });

  if (checkExist) {
    await SettingMessage.update(settingsData, {
      where: {
        whatsappId: settingsData.whatsappId
      }
    });

    const find = await SettingMessage.findOne({
      where: {
        whatsappId: settingsData.whatsappId
      }
    });

    return find;
  }
  const settings = await SettingMessage.create(settingsData);
  return settings;
};

export default CreateSettingService;
