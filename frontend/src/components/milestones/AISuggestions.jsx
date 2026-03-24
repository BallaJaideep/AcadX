import { ensureAbsoluteUrl, getFriendlyHostname } from "../../utils/linkUtils";
import "./AISuggestions.css";

/**
 * AISuggestions Component
 * Renders structured AI-generated resources with robust link handling.
 */
const AISuggestions = ({ suggestions, onAccept, onReject }) => {
  if (!Array.isArray(suggestions)) return null;

  return (
    <div className="exe-ai-brief">
      <div className="ai-brief-header">
        <span className="label-small-gold">Diagnostic Resources</span>
        <div className="ai-badge">Automated Insight</div>
      </div>

      <div className="ai-suggestions-content">
        {suggestions.map((item, index) => (
          <div key={index} className="ai-suggestion-item">
            <h6 className="ai-suggestion-title">
              <span className="bullet"></span>
              {item.title}
            </h6>

            {Array.isArray(item.links) && item.links.length > 0 && (
              <div className="ai-resource-links">
                {item.links.map((link, i) => {
                  const absoluteUrl = ensureAbsoluteUrl(link);
                  const hostname = getFriendlyHostname(link);

                  return (
                    <a
                      key={i}
                      href={absoluteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`ai-link-pill ${hostname.includes('youtube') ? 'yt' : ''}`}
                    >
                      {hostname.includes('youtube') ? '🎥' : '🔗'} {hostname}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* FEEDBACK ACTIONS */}
      <div className="ai-brief-footer">
        <button className="exe-btn-ghost-success" onClick={onAccept}>
          Resolve with AI
        </button>
        <button className="exe-btn-ghost-danger" onClick={onReject}>
          Escalate to Faculty
        </button>
      </div>
    </div>
  );
};

export default AISuggestions;