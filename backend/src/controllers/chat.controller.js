import Chat from "../models/Chat.model.js";
import { getSystemPrompt } from "../utils/chatPrompt.util.js";
import { buildChatContext } from "../utils/chatContext.util.js";
import { askGemini } from "../services/geminiChat.service.js";

/* ======================================================
   SEND MESSAGE TO AI CHATBOT
   POST /api/chat/send
====================================================== */
export const sendMessage = async (req, res) => {
  try {
    const user = req.user;
    const { message } = req.body;

    /* =========================
       VALIDATION
    ========================= */
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    /* =========================
       LOAD / CREATE CHAT
    ========================= */
    let chat = await Chat.findOne({ userId: user._id });

    if (!chat) {
      chat = new Chat({
        userId: user._id,
        role: user.role,
        messages: [],
      });
    }

    /* =========================
       STORE USER MESSAGE
    ========================= */
    chat.messages.push({
      sender: "user",
      text: message.trim(),
      createdAt: new Date(),
    });

    /* =========================
       BUILD AI INPUT
    ========================= */
    const systemPrompt = getSystemPrompt(user.role);
    const context = await buildChatContext(user);

    /* =========================
       GEMINI CALL
    ========================= */
    const aiReply = await askGemini({
      systemPrompt,
      context,
      userMessage: message.trim(),
    });

    /* =========================
       STORE AI MESSAGE
    ========================= */
    chat.messages.push({
      sender: "ai",
      text: aiReply,
      createdAt: new Date(),
    });

    await chat.save();

    /* =========================
       RESPONSE
    ========================= */
    return res.json({
      reply: aiReply,
    });
  } catch (error) {
    console.error("❌ Chatbot sendMessage error:", error);

    return res.status(500).json({
      message: "Chatbot failed to respond",
    });
  }
};

