import { useEffect, useRef, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import QuickQuestions from "./QuickQuestions";
import "./chatbot.css";
import { 
  Send, 
  X, 
  Sparkles, 
  Bot, 
  Zap,
  ShieldCheck
} from "lucide-react";

const Chatbot = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Handle body lock for mobile responsiveness
  useEffect(() => {
    if (open && window.innerWidth <= 768) {
      document.body.classList.add("chat-lock");
    } else {
      document.body.classList.remove("chat-lock");
    }
    return () => document.body.classList.remove("chat-lock");
  }, [open]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chat/send", { message: text });
      setMessages((prev) => [...prev, { sender: "ai", text: res.data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Synchronization failure. Please re-attempt your inquiry." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* PREMIUM FLOATING TRIGGER */}
      {!open && (
        <button className="exe-chatbot-fab" onClick={() => setOpen(true)}>
          <Sparkles className="spark-icon" />
        </button>
      )}

      {open && (
        <div className="exe-chat-window">
          {/* HEADER LAYER */}
          <div className="exe-chat-header">
            <div className="header-identity">
              <span className="ai-dot active"></span>
              <div className="identity-text">
                <span className="main-name">
                  <Bot size={16} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                  AcadX AI
                </span>
                <span className="sub-status">Neural Assistant Active</span>
              </div>
            </div>
            <button className="close-btn" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* CHAT BODY */}
          <div className="exe-chat-body">
            {messages.length === 0 && (
              <div className="welcome-area">
                <div className="welcome-banner">
                  <span className="label-small">
                    <Zap size={10} style={{ marginRight: 4 }} /> System Optimized
                  </span>
                  <p>How can I assist your workflow today?</p>
                </div>
                <QuickQuestions role={user?.role} onSelect={sendMessage} />
              </div>
            )}

            <div className="messages-container">
              {messages.map((m, i) => (
                <div key={i} className={`exe-chat-bubble ${m.sender}`}>
                  <div className="bubble-content">{m.text}</div>
                </div>
              ))}

              {loading && (
                <div className="exe-chat-bubble ai">
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* INPUT AREA */}
          <div className="exe-chat-input-zone">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Inquire AcadX Intelligence..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            />
            <button className="send-btn" onClick={() => sendMessage(input)}>
              <Send size={18} />
            </button>
          </div>
          
          <div style={{ padding: '8px 32px', fontSize: '9px', color: '#94A3B8', textAlign: 'center', background: 'white' }}>
            <ShieldCheck size={10} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            AI SECURED REGISTRY
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;