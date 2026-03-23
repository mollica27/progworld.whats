import MassMessages from "../../models/MassMessages";

interface ChatbotData {
  message: string;
  phone: string;
  whatsappId?: number;
}

const CreateChatBotServices = async (
  chatBotData: ChatbotData
): Promise<MassMessages> => {
  const chatBot = await MassMessages.create({
    ...chatBotData,
    whatsappId: Number(chatBotData.whatsappId)
  });

  return chatBot;
};

export default CreateChatBotServices;
