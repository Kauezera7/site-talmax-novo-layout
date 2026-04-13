const DANGEROUS_BLOCK_TAG_PATTERN = /<\s*(script|style|iframe|object|embed|svg|math|link|meta)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;
const HTML_COMMENT_PATTERN = /<!--[\s\S]*?-->/g;
const HTML_BREAK_PATTERN = /<\s*br\s*\/?>/gi;
const HTML_BLOCK_CLOSE_PATTERN = /<\/\s*(p|div|section|article|aside|header|footer|main|li|ul|ol|h[1-6]|tr|table|thead|tbody)\s*>/gi;
const HTML_TAG_PATTERN = /<\/?[^>]+>/g;
const CONTROL_CHAR_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const UNSAFE_PROTOCOL_PATTERN = /^(?:javascript|data|vbscript|file):/i;
const ABSOLUTE_URL_PATTERN = /^(?:[a-z][a-z0-9+.-]*:)?\/\//i;
const CLOUDINARY_PATH_PATTERN = /^res\.cloudinary\.com\//i;
const RELATIVE_PROTOCOL_PATTERN = /^\/\//;

const normalizeTextValue = (value) => (
  typeof value === 'string' ? value.replace(/\r\n?/g, '\n') : String(value ?? '')
);

const sanitizeTextInput = (value, options = {}) => {
  if (value === undefined || value === null) {
    return '';
  }

  const {
    preserveNewlines = true,
    maxLength = null
  } = options;

  let sanitized = normalizeTextValue(value)
    .replace(DANGEROUS_BLOCK_TAG_PATTERN, '')
    .replace(HTML_COMMENT_PATTERN, '')
    .replace(HTML_BREAK_PATTERN, '\n')
    .replace(HTML_BLOCK_CLOSE_PATTERN, '\n')
    .replace(HTML_TAG_PATTERN, '')
    .replace(CONTROL_CHAR_PATTERN, '');

  sanitized = preserveNewlines
    ? sanitized
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
    : sanitized.replace(/\s+/g, ' ').trim();

  if (Number.isInteger(maxLength) && maxLength >= 0) {
    return sanitized.slice(0, maxLength);
  }

  return sanitized;
};

const sanitizeUrlLikeValue = (value) => sanitizeTextInput(value, { preserveNewlines: false }).replace(/\s+/g, '');

const sanitizeNavigationTarget = (value, options = {}) => {
  const {
    allowExternal = true,
    allowRelative = true
  } = options;

  const sanitized = sanitizeUrlLikeValue(value);

  if (!sanitized || RELATIVE_PROTOCOL_PATTERN.test(sanitized) || UNSAFE_PROTOCOL_PATTERN.test(sanitized)) {
    return '';
  }

  if (ABSOLUTE_URL_PATTERN.test(sanitized)) {
    if (!allowExternal) {
      return '';
    }

    try {
      const parsedUrl = new URL(sanitized);
      return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsedUrl.protocol) ? sanitized : '';
    } catch (error) {
      return '';
    }
  }

  if (!allowRelative) {
    return '';
  }

  if (/^[?#]/.test(sanitized) || sanitized.startsWith('/')) {
    return sanitized;
  }

  return `/${sanitized.replace(/^\.?\/+/, '')}`;
};

const sanitizeAssetReference = (value, options = {}) => {
  const {
    allowExternal = true,
    allowRelative = true
  } = options;

  const sanitized = sanitizeUrlLikeValue(value);

  if (!sanitized || RELATIVE_PROTOCOL_PATTERN.test(sanitized) || UNSAFE_PROTOCOL_PATTERN.test(sanitized)) {
    return '';
  }

  if (CLOUDINARY_PATH_PATTERN.test(sanitized)) {
    return `https://${sanitized}`;
  }

  if (ABSOLUTE_URL_PATTERN.test(sanitized)) {
    if (!allowExternal) {
      return '';
    }

    try {
      const parsedUrl = new URL(sanitized);
      return ['http:', 'https:'].includes(parsedUrl.protocol) ? sanitized : '';
    } catch (error) {
      return '';
    }
  }

  if (!allowRelative) {
    return '';
  }

  return sanitized;
};

module.exports = {
  sanitizeAssetReference,
  sanitizeNavigationTarget,
  sanitizeTextInput
};
