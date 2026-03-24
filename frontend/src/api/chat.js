import api from "./client";

export const sendChatMessage = async (message) => {
  const res = await api.post("/chat/send", { message });
  return res.data.reply;
};
