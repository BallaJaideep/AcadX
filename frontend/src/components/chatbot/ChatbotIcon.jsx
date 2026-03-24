import "./ChatbotIcon.css";

const ChatbotIcon = ({ onClick }) => {
  return (
    <button className="exe-chatbot-trigger" onClick={onClick} aria-label="Open AI Assistant">
      <div className="icon-wrapper">
        <span className="ai-spark">✨</span>
      </div>
      <div className="trigger-ping"></div>
    </button>
  );
};

export default ChatbotIcon;