/**
 * Ensures a URL has a protocol (defaults to https://) 
 * and handles common malformed structures from AI responses.
 */
export const ensureAbsoluteUrl = (url) => {
  if (!url) return "#";
  
  let cleanUrl = url.trim();
  if (cleanUrl.length < 3) return "#";
  
  // Remove markdown formatting if present [Title](url)
  const mdMatch = cleanUrl.match(/\[.*\]\((.*)\)/);
  if (mdMatch) cleanUrl = mdMatch[1];

  // If it's already a full URL, just return it
  if (/^https?:\/\//i.test(cleanUrl)) {
    return cleanUrl;
  }

  // Detect if it's a domain-like string (e.g. youtube.com/...)
  // Must have at least one dot and look like a domain
  const isDomainLike = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i.test(cleanUrl) && cleanUrl.includes('.');

  if (isDomainLike) {
    return `https://${cleanUrl.replace(/^\/*/, '')}`;
  }

  // Fallback: If it's not a URL, treat it as a refined search query
  // Clean special characters that are likely AI hallucination garbage
  const searchQuery = cleanUrl.replace(/[^\w\s\-\.]/gi, ' ').trim();
  if (!searchQuery) return "#";
  
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
};

/**
 * Extracts a friendly display name for a URL
 */
export const getFriendlyHostname = (url) => {
  try {
    const cleanUrl = ensureAbsoluteUrl(url);
    if (cleanUrl.includes('search_query=')) return 'YouTube Search';
    
    const u = new URL(cleanUrl);
    return u.hostname.replace('www.', '');
  } catch (e) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube.com';
    return 'resource';
  }
};
