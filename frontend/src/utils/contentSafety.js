const DANGEROUS_BLOCK_TAG_PATTERN = /<\s*(script|style|iframe|object|embed|svg|math|link|meta)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;
const HTML_COMMENT_PATTERN = /<!--[\s\S]*?-->/g;
const HTML_BREAK_PATTERN = /<\s*br\s*\/?>/gi;
const HTML_BLOCK_CLOSE_PATTERN = /<\/\s*(p|div|section|article|aside|header|footer|main|li|ul|ol|h[1-6]|tr|table|thead|tbody)\s*>/gi;
const HTML_TAG_PATTERN = /<\/?[^>]+>/g;
const CONTROL_CHAR_PATTERN = new RegExp(
  `[${String.fromCharCode(0)}-${String.fromCharCode(8)}${String.fromCharCode(11)}${String.fromCharCode(12)}${String.fromCharCode(14)}-${String.fromCharCode(31)}${String.fromCharCode(127)}]`,
  'g'
);
const UNSAFE_PROTOCOL_PATTERN = /^(?:javascript|data|vbscript|file):/i;
const ABSOLUTE_URL_PATTERN = /^(?:[a-z][a-z0-9+.-]*:)?\/\//i;
const CLOUDINARY_PATH_PATTERN = /^res\.cloudinary\.com\//i;
const RELATIVE_PROTOCOL_PATTERN = /^\/\//;
const VALID_SPECIAL_SECTION_MODES = new Set(['description', 'features', 'none']);

const normalizeTextValue = (value) => (
  typeof value === 'string' ? value.replace(/\r\n?/g, '\n') : String(value ?? '')
);

export const sanitizeTextInput = (value, options = {}) => {
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

export const sanitizeNavigationTarget = (value, options = {}) => {
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
    } catch {
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

export const isExternalNavigationTarget = (value) => /^(?:https?:|mailto:|tel:)/i.test(String(value || '').trim());

export const sanitizeAssetReference = (value, options = {}) => {
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
      return ['http:', 'https:', 'blob:'].includes(parsedUrl.protocol) ? sanitized : '';
    } catch {
      return '';
    }
  }

  if (!allowRelative) {
    return '';
  }

  return sanitized;
};

const coerceBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;

  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();

    if (['true', '1', 'yes', 'sim', 'on'].includes(normalizedValue)) return true;
    if (['false', '0', 'no', 'nao', 'off'].includes(normalizedValue)) return false;
  }

  return fallback;
};

const coerceInteger = (value, fallback = undefined) => {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isInteger(parsedValue) ? parsedValue : fallback;
};

const sanitizeStringList = (value, options = {}) => (
  Array.isArray(value)
    ? Array.from(new Set(value
      .map((item) => sanitizeTextInput(item, options))
      .filter(Boolean)))
    : []
);

const sanitizeTechSpecs = (value) => (
  (Array.isArray(value) ? value : [])
    .map((item) => ({
      label: sanitizeTextInput(item?.label || '', { preserveNewlines: false, maxLength: 160 }),
      value: sanitizeTextInput(item?.value || '', { preserveNewlines: true, maxLength: 2000 })
    }))
    .filter((item) => item.label || item.value)
);

const sanitizeProductTabs = (value) => (
  (Array.isArray(value) ? value : [])
    .map((section, index) => ({
      id: section?.id || `tab-${index}`,
      title: sanitizeTextInput(section?.title || '', { preserveNewlines: false, maxLength: 255 }),
      content: sanitizeTextInput(section?.content || '', { preserveNewlines: true, maxLength: 25000 }),
      contentAsList: coerceBoolean(section?.contentAsList ?? section?.content_as_list, false),
      showContentWithVideo: coerceBoolean(
        section?.showContentWithVideo ?? section?.show_content_with_video,
        true
      ),
      videoUrl: sanitizeNavigationTarget(section?.videoUrl ?? section?.video_url ?? '', {
        allowExternal: true,
        allowRelative: false
      })
    }))
    .filter((section) => section.title && (section.content || section.videoUrl))
);

const sanitizeMergeRanges = (value, rowCount, columnCount) => (
  (Array.isArray(value) ? value : [])
    .map((range) => {
      const startRow = coerceInteger(range?.startRow ?? range?.row, null);
      const endRow = coerceInteger(range?.endRow ?? range?.row, null);
      const startCol = coerceInteger(range?.startCol, null);
      const endCol = coerceInteger(range?.endCol, null);

      if (![startRow, endRow, startCol, endCol].every(Number.isInteger)) {
        return null;
      }

      return {
        startRow: Math.max(0, Math.min(startRow, rowCount)),
        endRow: Math.max(0, Math.min(endRow, rowCount)),
        startCol: Math.max(0, Math.min(startCol, Math.max(columnCount - 1, 0))),
        endCol: Math.max(0, Math.min(endCol, Math.max(columnCount - 1, 0)))
      };
    })
    .filter((range) => range && (range.endRow > range.startRow || range.endCol > range.startCol))
);

const sanitizeModelTable = (value) => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const headers = sanitizeStringList(value.headers, { preserveNewlines: false, maxLength: 200 }).slice(0, 20);

  if (headers.length === 0) {
    return null;
  }

  const rows = (Array.isArray(value.rows) ? value.rows : [])
    .slice(0, 50)
    .map((row) => {
      const normalizedRow = Array.isArray(row)
        ? row
          .slice(0, headers.length)
          .map((cell) => sanitizeTextInput(cell, { preserveNewlines: false, maxLength: 4000 }))
        : [];

      while (normalizedRow.length < headers.length) {
        normalizedRow.push('');
      }

      return normalizedRow;
    });

  return {
    headers,
    rows,
    mergeRanges: sanitizeMergeRanges(value.mergeRanges, rows.length + 1, headers.length)
  };
};

const sanitizeModelTables = (value) => (
  (Array.isArray(value) ? value : [])
    .map((item) => ({
      title: sanitizeTextInput(item?.title || '', { preserveNewlines: false, maxLength: 255 }),
      modelTable: sanitizeModelTable(item?.modelTable || item?.table || item)
    }))
    .filter((item) => item.modelTable)
);

const sanitizeSpecialSectionDisplay = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const nextValue = {};

  ['upcera', 'scanners', 'printers'].forEach((key) => {
    if (VALID_SPECIAL_SECTION_MODES.has(value[key])) {
      nextValue[key] = value[key];
    }
  });

  return Object.keys(nextValue).length > 0 ? nextValue : undefined;
};

export const parseSafeExtraData = (value) => {
  if (!value) {
    return {};
  }

  let parsedValue = value;

  if (typeof value === 'string') {
    try {
      parsedValue = JSON.parse(value);
    } catch {
      return {};
    }
  }

  if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
    return {};
  }

  const productTabs = sanitizeProductTabs(
    Array.isArray(parsedValue.product_tabs) && parsedValue.product_tabs.length > 0
      ? parsedValue.product_tabs
      : parsedValue.dynamicSections
  );
  const features = sanitizeStringList(parsedValue.features, { preserveNewlines: false, maxLength: 500 }).slice(0, 50);
  const techSpecs = sanitizeTechSpecs(parsedValue.techSpecs).slice(0, 50);
  const modelTables = sanitizeModelTables(parsedValue.modelTables).slice(0, 10);
  const fallbackModelTable = sanitizeModelTable(parsedValue.modelTable);
  const primaryModelTable = modelTables[0]?.modelTable || fallbackModelTable || undefined;
  const primaryModelTitle = modelTables[0]?.title || sanitizeTextInput(parsedValue.modelTitle || '', {
    preserveNewlines: false,
    maxLength: 255
  });
  const specialSectionDisplay = sanitizeSpecialSectionDisplay(parsedValue.specialSectionDisplay);
  const featuredOrder = coerceInteger(parsedValue.featured_order, undefined);

  return {
    descriptionTabLabel: sanitizeTextInput(parsedValue.descriptionTabLabel || '', { preserveNewlines: false, maxLength: 120 }),
    descriptionAsList: coerceBoolean(parsedValue.descriptionAsList, false),
    technicalTabLabel: sanitizeTextInput(parsedValue.technicalTabLabel || '', { preserveNewlines: false, maxLength: 120 }),
    product_tabs: productTabs,
    dynamicSections: productTabs,
    showFeatures: coerceBoolean(parsedValue.showFeatures, features.length > 0),
    hideModelData: coerceBoolean(parsedValue.hideModelData, false),
    showModelSection: coerceBoolean(parsedValue.showModelSection, true),
    showQuoteButton: coerceBoolean(parsedValue.showQuoteButton, true),
    features,
    techSpecs,
    modelTables,
    modelTitle: primaryModelTitle,
    modelTable: primaryModelTable,
    productBannerUrl: sanitizeAssetReference(parsedValue.productBannerUrl || ''),
    images: sanitizeStringList(parsedValue.images, { preserveNewlines: false, maxLength: 1000 }).map((item) => sanitizeAssetReference(item)).filter(Boolean),
    removedImages: sanitizeStringList(parsedValue.removedImages, { preserveNewlines: false, maxLength: 1000 }).map((item) => sanitizeAssetReference(item)).filter(Boolean),
    specialSectionDisplay,
    ...(Number.isInteger(featuredOrder) ? { featured_order: featuredOrder } : {})
  };
};
