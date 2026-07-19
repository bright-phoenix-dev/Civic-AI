/**
 * Aggressive HTML sanitizer to prevent XSS attacks.
 * Strips all HTML tags entirely instead of just escaping them.
 * 
 * @param {string} input - The raw user input string.
 * @returns {string} Sanitized string safe for rendering.
 */
export function sanitizeHTML(input) {
  if (input === null || input === undefined || typeof input !== 'string') return '';
  // Strip all HTML tags
  const noTags = input.replace(/<[^>]*>?/gm, '');
  // Escape any remaining special entities just in case
  return noTags
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * LLM Middleware Defense Simulator
 * Checks input for prompt injection keywords commonly used to override AI instructions.
 * Uses strict case-insensitive regex matching.
 * 
 * @param {string} text - The input text to check.
 * @returns {boolean} True if a prompt injection is detected.
 */
export function detectPromptInjection(text) {
  if (text === null || text === undefined || typeof text !== 'string') return false;
  
  // Strict case-insensitive pattern matching
  const injectionPatterns = [
    /ignore previous instructions/i,
    /forget previous instructions/i,
    /system prompt/i,
    /bypass/i,
    /override/i,
    /system bypass/i,
    /mark this as resolved instantly/i
  ];

  return injectionPatterns.some(pattern => pattern.test(text));
}
