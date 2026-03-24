const normalizeCategoryNames = (categoryNames) => {
  if (Array.isArray(categoryNames)) {
    return categoryNames.filter(Boolean).map((name) => String(name).trim()).filter(Boolean);
  }

  if (typeof categoryNames === 'string') {
    return categoryNames
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);
  }

  return [];
};

export const getVisibleCategoryLabel = (categoryNames, hiddenCategoryNames = []) => {
  const normalizedNames = normalizeCategoryNames(categoryNames);
  const visibleNames = normalizedNames.filter((name) => !hiddenCategoryNames.includes(name));

  if (visibleNames.length > 0) {
    return visibleNames.join(', ');
  }

  if (normalizedNames.length > 0) {
    return normalizedNames.join(', ');
  }

  return 'Sem categoria';
};

export const getNormalizedCategoryNames = normalizeCategoryNames;
