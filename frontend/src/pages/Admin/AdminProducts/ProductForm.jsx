import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Minus, Trash2, Save, X, UploadCloud, ChevronRight, CheckCircle, Table
} from 'lucide-react';
import { apiAssetPath } from '../../../utils/assets';
import './AdminProducts.css';

const createInitialFormState = () => ({
  name: '',
  is_active: true,
  category_ids: [],
  sub_category_ids: [],
  description: '',
  descriptionTabLabel: '',
  descriptionAsList: false,
  technicalTabLabel: '',
  productTabs: [],
  showFeatures: false,
  hideModelData: false,
  showModelSection: true,
  showQuoteButton: true,
  images: [],
  features: [''],
  techSpecs: [{ label: '', value: '' }],
  modelTables: [{
    title: '',
    modelTable: { headers: ['Tipo / Referencia', 'Codigo'], rows: [['', '']] }
  }]
});

const createEmptyModelTable = () => ({
  headers: ['Tipo / Referencia', 'Codigo'],
  rows: [['', '']],
  mergedHeader: false,
  mergedHeaderEndColumn: null,
  mergeRanges: []
});

const createTechnicalTable = () => ({
  title: '',
  modelTable: createEmptyModelTable()
});

const clampTableDimension = (value, fallback) => {
  const parsedValue = Number.parseInt(value, 10);
  if (!Number.isFinite(parsedValue)) return fallback;
  return Math.min(Math.max(parsedValue, 1), 20);
};

const getSpreadsheetColumnLabel = (index) => {
  let value = index + 1;
  let label = '';

  while (value > 0) {
    const remainder = (value - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    value = Math.floor((value - 1) / 26);
  }

  return label;
};

const sanitizeMergeRanges = (mergeRanges, rowCount, columnCount) => {
  if (!Array.isArray(mergeRanges) || rowCount <= 0 || columnCount <= 0) {
    return [];
  }

  const uniqueRanges = new Map();

  mergeRanges.forEach((range) => {
    const rawStartRow = Number.parseInt(range?.startRow ?? range?.row, 10);
    const rawEndRow = Number.parseInt(range?.endRow ?? range?.row, 10);
    const rawStart = Number.parseInt(range?.startCol, 10);
    const rawEnd = Number.parseInt(range?.endCol, 10);

    if (!Number.isInteger(rawStartRow) || !Number.isInteger(rawEndRow) || !Number.isInteger(rawStart) || !Number.isInteger(rawEnd)) {
      return;
    }

    const startRow = Math.min(Math.max(Math.min(rawStartRow, rawEndRow), 0), rowCount - 1);
    const endRow = Math.min(Math.max(Math.max(rawStartRow, rawEndRow), 0), rowCount - 1);
    const startCol = Math.min(Math.max(Math.min(rawStart, rawEnd), 0), columnCount - 1);
    const endCol = Math.min(Math.max(Math.max(rawStart, rawEnd), 0), columnCount - 1);

    if (endCol <= startCol && endRow <= startRow) {
      return;
    }

    uniqueRanges.set(`${startRow}-${endRow}-${startCol}-${endCol}`, { startRow, endRow, startCol, endCol });
  });

  return Array.from(uniqueRanges.values()).sort((left, right) => {
    if (left.startRow !== right.startRow) {
      return left.startRow - right.startRow;
    }

    if (left.endRow !== right.endRow) {
      return left.endRow - right.endRow;
    }

    if (left.startCol !== right.startCol) {
      return left.startCol - right.startCol;
    }

    return left.endCol - right.endCol;
  });
};

const getLegacyMergedHeaderRange = (modelTable, columnCount) => {
  if (!modelTable?.mergedHeader || columnCount <= 1) {
    return [];
  }

  const endCol = Number.isInteger(modelTable.mergedHeaderEndColumn)
    ? Math.max(0, Math.min(modelTable.mergedHeaderEndColumn, columnCount - 1))
    : columnCount - 1;

  if (endCol <= 0) {
    return [];
  }

  return [{ startRow: 0, endRow: 0, startCol: 0, endCol }];
};

const getMergedHeaderRange = (mergeRanges) => (
  Array.isArray(mergeRanges)
    ? mergeRanges.find((range) => range.startRow === 0 && range.endRow === 0 && range.startCol === 0) || null
    : null
);

const getMergeRangeForCell = (mergeRanges, rowIndex, colIndex) => (
  Array.isArray(mergeRanges)
    ? mergeRanges.find((range) => (
      range.startRow <= rowIndex
      && range.endRow >= rowIndex
      && range.startCol <= colIndex
      && range.endCol >= colIndex
    )) || null
    : null
);

const removeOverlappingMergeRanges = (mergeRanges, startRow, endRow, startCol, endCol) => (
  (Array.isArray(mergeRanges) ? mergeRanges : []).filter((range) => (
    range.endRow < startRow
    || range.startRow > endRow
    || range.endCol < startCol
    || range.startCol > endCol
  ))
);

const adjustMergeRangesForRemovedColumn = (mergeRanges, removedColumnIndex, rowCount, columnCount) => (
  sanitizeMergeRanges(
    (Array.isArray(mergeRanges) ? mergeRanges : []).map((range) => {
      if (removedColumnIndex < range.startCol) {
        return {
          ...range,
          startCol: range.startCol - 1,
          endCol: range.endCol - 1
        };
      }

      if (removedColumnIndex > range.endCol) {
        return range;
      }

      return {
        ...range,
        endCol: range.endCol - 1
      };
    }),
    rowCount,
    columnCount
  )
);

const adjustMergeRangesForRemovedRow = (mergeRanges, removedRowIndex, rowCount, columnCount) => (
  sanitizeMergeRanges(
    (Array.isArray(mergeRanges) ? mergeRanges : [])
      .filter((range) => !(range.startRow === removedRowIndex && range.endRow === removedRowIndex))
      .map((range) => (
        removedRowIndex < range.startRow
          ? { ...range, startRow: range.startRow - 1, endRow: range.endRow - 1 }
          : removedRowIndex > range.endRow
            ? range
            : { ...range, endRow: range.endRow - 1 }
      )),
    rowCount,
    columnCount
  )
);

const createDragSelectionState = () => ({
  tableIndex: null,
  startRow: null,
  startCol: null,
  endRow: null,
  endCol: null,
  isDragging: false,
  hasMoved: false
});

const createDynamicSection = () => ({
  title: '',
  content: '',
  contentAsList: false
});

const normalizeModelTable = (modelTable) => {
  const fallback = createEmptyModelTable();

  if (!modelTable || !Array.isArray(modelTable.headers) || !Array.isArray(modelTable.rows)) {
    return fallback;
  }

  const headers = modelTable.headers.length > 0
    ? modelTable.headers.map((header) => (typeof header === 'string' ? header : ''))
    : fallback.headers;

  const rows = modelTable.rows.length > 0
    ? modelTable.rows.map((row) => {
      const normalizedRow = Array.isArray(row) ? row.map((cell) => (typeof cell === 'string' ? cell : '')) : [];
      while (normalizedRow.length < headers.length) {
        normalizedRow.push('');
      }
      return normalizedRow.slice(0, headers.length);
    })
    : [];

  const mergeRanges = sanitizeMergeRanges(
    Array.isArray(modelTable.mergeRanges) && modelTable.mergeRanges.length > 0
      ? modelTable.mergeRanges
      : getLegacyMergedHeaderRange(modelTable, headers.length),
    rows.length + 1,
    headers.length
  );

  const mergedHeaderRange = getMergedHeaderRange(mergeRanges);

  return {
    headers,
    rows,
    mergeRanges,
    mergedHeader: Boolean(mergedHeaderRange),
    mergedHeaderEndColumn: mergedHeaderRange?.endCol ?? headers.length - 1
  };
};

const normalizeTechnicalTables = (tables, legacyTitle = '', legacyTable = null) => {
  if (Array.isArray(tables) && tables.length > 0) {
    return tables.map((table) => ({
      title: typeof table?.title === 'string' ? table.title : '',
      modelTable: normalizeModelTable(table?.modelTable || table?.table || table)
    }));
  }

  return [{
    title: typeof legacyTitle === 'string' ? legacyTitle : '',
    modelTable: normalizeModelTable(legacyTable)
  }];
};

const normalizeDynamicSections = (sections) => (
  Array.isArray(sections)
    ? sections.map((section) => ({
      title: typeof section?.title === 'string' ? section.title : '',
      content: typeof section?.content === 'string' ? section.content : '',
      contentAsList: Boolean(section?.contentAsList)
    }))
    : []
);

const normalizeProductTabs = (tabs, legacySections = []) => {
  if (Array.isArray(tabs) && tabs.length > 0) {
    return tabs.map((tab) => ({
      id: tab?.id,
      title: typeof tab?.title === 'string' ? tab.title : '',
      content: typeof tab?.content === 'string' ? tab.content : '',
      contentAsList: Boolean(tab?.contentAsList || tab?.content_as_list)
    }));
  }

  return normalizeDynamicSections(legacySections);
};

const buildInitialPreviewList = (mainImage, extraImages) => {
  const normalizedImages = Array.isArray(extraImages)
    ? extraImages.filter(Boolean)
    : [];

  if (!mainImage) {
    return Array.from(new Set(normalizedImages));
  }

  return Array.from(new Set([mainImage, ...normalizedImages]));
};

const ButtonSavingIndicator = () => (
  <span className="loader loader_bubble admin-button-loader" aria-hidden="true" />
);

const autoResizeTableTextarea = (element) => {
  if (!(element instanceof HTMLTextAreaElement)) return;

  element.style.height = '48px';
  element.style.height = `${Math.max(element.scrollHeight, 48)}px`;
};

const ProductForm = ({
  initialData,
  categories,
  mainCategories,
  subCategories,
  onSubmit,
  onCancel,
  isSubmitting = false,
  onValidationError
}) => {
  const [formData, setFormData] = useState(createInitialFormState);
  const [existingImages, setExistingImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [primaryPreview, setPrimaryPreview] = useState('');
  const [removedExistingImages, setRemovedExistingImages] = useState([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSubCategoryDropdownOpen, setIsSubCategoryDropdownOpen] = useState(false);
  const [isTableSizeOpen, setIsTableSizeOpen] = useState(false);
  const [tablePickerPreview, setTablePickerPreview] = useState({});
  const [dragSelection, setDragSelection] = useState(createDragSelectionState);
  const [activeSheetCell, setActiveSheetCell] = useState(null);
  const cellInputRefs = useRef({});
  const previews = [...existingImages, ...newImagePreviews];

  useEffect(() => {
    if (initialData) {
      let extra = {};
      try {
        extra = typeof initialData.extra_data === 'string' ? JSON.parse(initialData.extra_data) : (initialData.extra_data || {});
      } catch (e) {
        extra = {};
      }

      setFormData({
        name: initialData.name || '',
        is_active: initialData.is_active !== false,
        category_ids: initialData.category_ids || [],
        sub_category_ids: initialData.sub_category_ids || [],
        description: initialData.description || '',
        descriptionTabLabel: extra.descriptionTabLabel || '',
        descriptionAsList: extra.descriptionAsList || false,
        technicalTabLabel: extra.technicalTabLabel || '',
        productTabs: normalizeProductTabs(initialData.product_tabs, extra.dynamicSections),
        showFeatures: extra.showFeatures !== false && Boolean(extra.features && extra.features.length > 0),
        hideModelData: false,
        showModelSection: extra.showModelSection !== false,
        showQuoteButton: extra.showQuoteButton !== false,
        images: [],
        features: (extra.features && extra.features.length > 0) ? extra.features : [''],
        techSpecs: (extra.techSpecs && extra.techSpecs.length > 0) ? extra.techSpecs : [{ label: '', value: '' }],
        modelTitle: extra.modelTitle || '',
        modelTable: extra.modelTable || { headers: ['Tipo / Referência', 'Código'], rows: [['', '']] }
      });

      setFormData((current) => ({
        ...current,
        modelTables: normalizeTechnicalTables(extra.modelTables, extra.modelTitle, extra.modelTable).map((table, index) => ({
          ...table,
          modelTable: normalizeModelTable(
            index === 0 && extra.singleCellFirstRow
              ? {
                ...table.modelTable,
                mergedHeader: true,
                mergedHeaderEndColumn: table.modelTable.mergedHeaderEndColumn ?? (table.modelTable.headers.length - 1)
              }
              : table.modelTable
          )
        }))
      }));

      const initialPreviews = buildInitialPreviewList(initialData.main_image, extra.images);

      if (initialPreviews.length > 0) {
        setExistingImages(initialPreviews);
        setNewImagePreviews([]);
        setPrimaryPreview(initialData.main_image || initialPreviews[0]);
      } else {
        setExistingImages([]);
        setNewImagePreviews([]);
        setPrimaryPreview('');
      }
      setRemovedExistingImages([]);
      return;
    }

    setFormData(createInitialFormState());
    setExistingImages([]);
    setNewImagePreviews([]);
    setPrimaryPreview('');
    setRemovedExistingImages([]);
  }, [initialData]);

  useEffect(() => {
    const handlePointerUp = () => {
      setDragSelection((current) => (
        current.isDragging
          ? { ...current, isDragging: false }
          : current
      ));
    };

    window.addEventListener('mouseup', handlePointerUp);

    return () => {
      window.removeEventListener('mouseup', handlePointerUp);
    };
  }, []);

  const getFilteredSubCategories = () => {
    // Se nenhuma categoria principal selecionada, mostra todas as subcategorias
    if (formData.category_ids.length === 0) return subCategories;
    // Se há categorias principais selecionadas, mostra apenas as subcategorias dessas categorias
    return subCategories.filter((s) => formData.category_ids.includes(Number(s.parent_id)));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const addedPreviews = files.map((file) => URL.createObjectURL(file));
    setFormData((current) => ({ ...current, images: [...current.images, ...files] }));
    setNewImagePreviews((current) => [...current, ...addedPreviews]);

    if (!primaryPreview && previews.length === 0) {
      setPrimaryPreview(addedPreviews[0]);
    }
  };

  const removeImage = (index) => {
    const previewToRemove = previews[index];
    const isBlobPreview = previewToRemove?.startsWith('blob:');
    let remainingPreviews = previews.filter((_, previewIndex) => previewIndex !== index);

    if (isBlobPreview) {
      URL.revokeObjectURL(previewToRemove);
      const blobIndex = newImagePreviews.indexOf(previewToRemove);
      setNewImagePreviews((current) => current.filter((preview) => preview !== previewToRemove));

      setFormData((current) => ({
        ...current,
        images: current.images.filter((_, fileIndex) => fileIndex !== blobIndex)
      }));
    } else if (previewToRemove) {
      setExistingImages((current) => current.filter((imagePath) => imagePath !== previewToRemove));
      setRemovedExistingImages((current) => Array.from(new Set([...current, previewToRemove])));
    }

    if (primaryPreview === previewToRemove) {
      setPrimaryPreview(remainingPreviews[0] || '');
    }
  };

  const updateTechnicalTable = (tableIndex, updater) => {
    setFormData((current) => ({
      ...current,
      modelTables: current.modelTables.map((table, currentIndex) => (
        currentIndex === tableIndex
          ? updater({
            ...table,
            modelTable: normalizeModelTable(table.modelTable)
          })
          : table
      ))
    }));
  };

  const addTechnicalTable = () => {
    setFormData((current) => ({
      ...current,
      modelTables: [...current.modelTables, createTechnicalTable()]
    }));
  };

  const removeTechnicalTable = (tableIndex) => {
    if (formData.modelTables.length <= 1) return;

    setFormData((current) => ({
      ...current,
      modelTables: current.modelTables.filter((_, currentIndex) => currentIndex !== tableIndex)
    }));
  };

  const updateTechnicalTableTitle = (tableIndex, value) => {
    updateTechnicalTable(tableIndex, (table) => ({
      ...table,
      title: value
    }));
  };

  const addTableHeader = (tableIndex) => {
    updateTechnicalTable(tableIndex, (table) => {
      const newHeaders = [...table.modelTable.headers, 'Nova Coluna'];
      const newRows = table.modelTable.rows.map((row) => [...row, '']);

      return {
        ...table,
        modelTable: { headers: newHeaders, rows: newRows }
      };
    });
  };

  const removeTableHeader = (tableIndex, headerIndex) => {
    const currentTable = formData.modelTables[tableIndex];
    if (!currentTable || currentTable.modelTable.headers.length <= 1) return;

    updateTechnicalTable(tableIndex, (table) => ({
      ...table,
      modelTable: {
        headers: table.modelTable.headers.filter((_, index) => index !== headerIndex),
        rows: table.modelTable.rows.map((row) => row.filter((_, index) => index !== headerIndex)),
        mergeRanges: adjustMergeRangesForRemovedColumn(
          table.modelTable.mergeRanges,
          headerIndex,
          table.modelTable.rows.length + 1,
          table.modelTable.headers.length - 1
        )
      }
    }));
  };

  const removeLastTableHeader = (tableIndex) => {
    const currentTable = formData.modelTables[tableIndex];
    if (!currentTable || currentTable.modelTable.headers.length <= 1) return;
    removeTableHeader(tableIndex, currentTable.modelTable.headers.length - 1);
  };

  const resizeTable = (tableIndex, nextRowCount, nextColumnCount) => {
    updateTechnicalTable(tableIndex, (table) => {
      const columnCount = clampTableDimension(nextColumnCount, table.modelTable.headers.length || 1);
      const rowCount = clampTableDimension(nextRowCount, table.modelTable.rows.length || 1);

      const headers = Array.from({ length: columnCount }, (_, index) => (
        table.modelTable.headers[index] ?? `Coluna ${index + 1}`
      ));

      const rows = Array.from({ length: rowCount }, (_, rowIndex) => {
        const sourceRow = Array.isArray(table.modelTable.rows[rowIndex]) ? table.modelTable.rows[rowIndex] : [];
        return Array.from({ length: columnCount }, (_, columnIndex) => sourceRow[columnIndex] ?? '');
      });

      return {
        ...table,
        modelTable: {
          headers,
          rows,
          mergeRanges: sanitizeMergeRanges(table.modelTable.mergeRanges, rows.length + 1, headers.length)
        }
      };
    });
  };

  const updateTablePickerPreview = (tableIndex, rows, columns) => {
    setTablePickerPreview((current) => ({
      ...current,
      [tableIndex]: { rows, columns }
    }));
  };

  const clearTablePickerPreview = (tableIndex, fallbackRows, fallbackColumns) => {
    setTablePickerPreview((current) => ({
      ...current,
      [tableIndex]: { rows: fallbackRows, columns: fallbackColumns }
    }));
  };

  const updateTableHeader = (tableIndex, headerIndex, value) => {
    updateTechnicalTable(tableIndex, (table) => {
      const newHeaders = [...table.modelTable.headers];
      newHeaders[headerIndex] = value;

      return {
        ...table,
        modelTable: { ...table.modelTable, headers: newHeaders }
      };
    });
  };

  const startDragSelection = (tableIndex, rowIndex, colIndex) => {
    setDragSelection({
      tableIndex,
      startRow: rowIndex,
      startCol: colIndex,
      endRow: rowIndex,
      endCol: colIndex,
      isDragging: true,
      hasMoved: false
    });
  };

  const updateDragSelection = (tableIndex, rowIndex, colIndex) => {
    setDragSelection((current) => {
      if (!current.isDragging || current.tableIndex !== tableIndex || current.startRow === null || current.startCol === null) {
        return current;
      }

      const nextSelection = {
        ...current,
        endRow: rowIndex,
        endCol: colIndex,
        hasMoved: current.hasMoved
          || current.startRow !== rowIndex
          || current.startCol !== colIndex
      };

      return nextSelection;
    });
  };

  const focusCellInput = (tableIndex, rowIndex, colIndex) => {
    const key = `${tableIndex}-${rowIndex}-${colIndex}`;
    const target = cellInputRefs.current[key];

    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      requestAnimationFrame(() => {
        target.focus();
        target.select?.();
      });
    }
  };

  const finishDragSelection = (tableIndex, rowIndex, colIndex) => {
    setDragSelection((current) => {
      if (!current.isDragging || current.tableIndex !== tableIndex) {
        return current;
      }

      const hasMoved = current.hasMoved
        || current.startRow !== rowIndex
        || current.startCol !== colIndex;

      if (!hasMoved) {
        focusCellInput(tableIndex, rowIndex, colIndex);
      }

      return {
        ...current,
        endRow: rowIndex,
        endCol: colIndex,
        isDragging: false,
        hasMoved
      };
    });
  };

  const clearDragSelection = () => {
    setDragSelection(createDragSelectionState());
  };

  const getSelectedMergeRange = (tableIndex) => {
    if (dragSelection.tableIndex !== tableIndex || dragSelection.startRow === null || dragSelection.startCol === null || dragSelection.endCol === null) {
      return null;
    }

    return {
      startRow: Math.min(dragSelection.startRow, dragSelection.endRow ?? dragSelection.startRow),
      endRow: Math.max(dragSelection.startRow, dragSelection.endRow ?? dragSelection.startRow),
      startCol: Math.min(dragSelection.startCol, dragSelection.endCol),
      endCol: Math.max(dragSelection.startCol, dragSelection.endCol)
    };
  };

  const isCellInsideDragSelection = (tableIndex, rowIndex, colIndex) => {
    const selectedRange = getSelectedMergeRange(tableIndex);

    if (!selectedRange) {
      return false;
    }

    return rowIndex >= selectedRange.startRow
      && rowIndex <= selectedRange.endRow
      && colIndex >= selectedRange.startCol
      && colIndex <= selectedRange.endCol;
  };

  const applyMergeRange = (tableIndex) => {
    const table = formData.modelTables[tableIndex];
    if (!table) return;

    const selection = getSelectedMergeRange(tableIndex);
    if (!selection) return;

    const { startRow, endRow, startCol, endCol } = selection;

    if (endCol <= startCol && endRow <= startRow) {
      return;
    }

    updateTechnicalTable(tableIndex, (currentTable) => ({
      ...currentTable,
      modelTable: normalizeModelTable({
        ...currentTable.modelTable,
        mergeRanges: [
          ...removeOverlappingMergeRanges(currentTable.modelTable.mergeRanges, startRow, endRow, startCol, endCol),
          { startRow, endRow, startCol, endCol }
        ]
      })
    }));
    clearDragSelection();
  };

  const removeMergeRange = (tableIndex) => {
    const table = formData.modelTables[tableIndex];
    if (!table) return;

    const selection = getSelectedMergeRange(tableIndex);
    if (!selection) return;

    const mergeRange = getMergeRangeForCell(table.modelTable.mergeRanges, selection.startRow, selection.startCol) || selection;
    const startRow = mergeRange.startRow;
    const endRow = mergeRange.endRow;
    const startCol = mergeRange.startCol;
    const endCol = mergeRange.endCol;

    updateTechnicalTable(tableIndex, (currentTable) => ({
      ...currentTable,
      modelTable: normalizeModelTable({
        ...currentTable.modelTable,
        mergeRanges: removeOverlappingMergeRanges(currentTable.modelTable.mergeRanges, startRow, endRow, startCol, endCol)
      })
    }));
    clearDragSelection();
  };

  const clearSelectedRange = (tableIndex) => {
    const table = formData.modelTables[tableIndex];
    if (!table) return;

    const selection = getSelectedMergeRange(tableIndex);
    if (!selection) return;

    updateTechnicalTable(tableIndex, (currentTable) => {
      const headers = [...currentTable.modelTable.headers];
      const rows = currentTable.modelTable.rows.map((row) => [...row]);
      const cellsToClear = new Set();

      for (let rowIndex = selection.startRow; rowIndex <= selection.endRow; rowIndex += 1) {
        for (let colIndex = selection.startCol; colIndex <= selection.endCol; colIndex += 1) {
          const mergeRange = getMergeRangeForCell(currentTable.modelTable.mergeRanges, rowIndex, colIndex);
          const targetRow = mergeRange ? mergeRange.startRow : rowIndex;
          const targetCol = mergeRange ? mergeRange.startCol : colIndex;

          cellsToClear.add(`${targetRow}-${targetCol}`);
        }
      }

      cellsToClear.forEach((cellKey) => {
        const [targetRow, targetCol] = cellKey.split('-').map((value) => Number.parseInt(value, 10));

        if (targetRow === 0) {
          headers[targetCol] = '';
          return;
        }

        if (rows[targetRow - 1]) {
          rows[targetRow - 1][targetCol] = '';
        }
      });

      return {
        ...currentTable,
        modelTable: {
          ...currentTable.modelTable,
          headers,
          rows
        }
      };
    });

    clearDragSelection();
  };

  const handleSelectionDeleteKey = (event, tableIndex) => {
    if (event.key !== 'Delete') {
      return;
    }

    const selection = getSelectedMergeRange(tableIndex);
    if (!selection) {
      return;
    }

    const hasMultiCellSelection = selection.endRow > selection.startRow || selection.endCol > selection.startCol;
    if (!hasMultiCellSelection) {
      return;
    }

    event.preventDefault();
    clearSelectedRange(tableIndex);
  };

  const addTableRow = (tableIndex) => {
    const currentTable = formData.modelTables[tableIndex];
    if (!currentTable) return;

    const newRow = new Array(currentTable.modelTable.headers.length).fill('');
    updateTechnicalTable(tableIndex, (table) => ({
      ...table,
      modelTable: {
        ...table.modelTable,
        rows: [...table.modelTable.rows, newRow]
      }
    }));
  };

  const removeTableRow = (tableIndex, rowIndex) => {
    const currentTable = formData.modelTables[tableIndex];
    if (!currentTable || currentTable.modelTable.rows.length === 0) return;

    updateTechnicalTable(tableIndex, (table) => ({
      ...table,
      modelTable: {
        ...table.modelTable,
        rows: table.modelTable.rows.filter((_, index) => index !== rowIndex),
        mergeRanges: adjustMergeRangesForRemovedRow(
          table.modelTable.mergeRanges,
          rowIndex + 1,
          table.modelTable.rows.length,
          table.modelTable.headers.length
        )
      }
    }));
  };

  const updateTableCell = (tableIndex, rowIndex, colIndex, value) => {
    updateTechnicalTable(tableIndex, (table) => {
      const newRows = table.modelTable.rows.map((row) => [...row]);
      newRows[rowIndex][colIndex] = value;

      return {
        ...table,
        modelTable: { ...table.modelTable, rows: newRows }
      };
    });
  };

  const renderBuilderCells = ({
    tableIndex,
    rowNumber,
    values,
    isHeaderRow = false
  }) => {
    const table = formData.modelTables[tableIndex];
    if (!table) return null;

    return table.modelTable.headers.map((_, colIndex) => {
      const mergeRange = getMergeRangeForCell(table.modelTable.mergeRanges, rowNumber - 1, colIndex);
      const cellRefKey = `${tableIndex}-${rowNumber - 1}-${colIndex}`;
      const isMergedOrigin = Boolean(
        mergeRange
        && mergeRange.startCol === colIndex
        && mergeRange.startRow === rowNumber - 1
      );
      const isMergedCovered = Boolean(mergeRange && !isMergedOrigin);
      const sharedProps = {
        key: `${tableIndex}-${rowNumber}-${colIndex}`,
        className: [
          'builder-table__cell',
          isHeaderRow ? 'builder-table__cell--header' : '',
          mergeRange ? 'builder-table__cell--merged' : '',
          isMergedOrigin ? 'builder-table__cell--merged-origin' : '',
          isMergedCovered ? 'builder-table__cell--merged-covered' : '',
          isCellInsideDragSelection(tableIndex, rowNumber - 1, colIndex) ? 'is-selection-preview' : '',
          !isHeaderRow
            && activeSheetCell?.tableIndex === tableIndex
            && activeSheetCell?.rowIndex === rowNumber - 2
            && activeSheetCell?.colIndex === colIndex
            ? 'is-active'
            : ''
        ].filter(Boolean).join(' '),
        onMouseDown: (event) => {
          event.preventDefault();
          startDragSelection(tableIndex, rowNumber - 1, colIndex);
        },
        onMouseEnter: () => updateDragSelection(tableIndex, rowNumber - 1, colIndex),
        onMouseUp: () => finishDragSelection(tableIndex, rowNumber - 1, colIndex)
      };

      if (isHeaderRow) {
        return (
          <td {...sharedProps}>
            <input
              ref={(node) => {
                if (node) {
                  cellInputRefs.current[cellRefKey] = node;
                } else {
                  delete cellInputRefs.current[cellRefKey];
                }
              }}
              value={values[colIndex] || ''}
              onChange={(e) => updateTableHeader(tableIndex, colIndex, e.target.value)}
              onKeyDown={(event) => handleSelectionDeleteKey(event, tableIndex)}
            />
          </td>
        );
      }

      return (
        <td {...sharedProps}>
          <input
            ref={(node) => {
              if (node) {
                cellInputRefs.current[cellRefKey] = node;
              } else {
                delete cellInputRefs.current[cellRefKey];
              }
            }}
            type="text"
            disabled={isMergedCovered}
            value={values[colIndex] || ''}
            onFocus={() => setActiveSheetCell({ tableIndex, rowIndex: rowNumber - 2, colIndex })}
            onChange={(e) => updateTableCell(tableIndex, rowNumber - 2, colIndex, e.target.value)}
            onPaste={(e) => handleTableCellPaste(e, tableIndex, rowNumber - 2, colIndex)}
            onKeyDown={(event) => handleSelectionDeleteKey(event, tableIndex)}
          />
        </td>
      );
    });
  };

  const renderSelectionActions = (tableIndex) => {
    const selectedRange = getSelectedMergeRange(tableIndex);
    const table = formData.modelTables[tableIndex];

    if (!selectedRange || !table) {
      return null;
    }

    const selectedMergeRange = getMergeRangeForCell(
      table.modelTable.mergeRanges,
      selectedRange.startRow,
      selectedRange.startCol
    );
    const canMergeSelection = selectedRange.endCol > selectedRange.startCol;
    const canMergeVerticalSelection = selectedRange.endRow > selectedRange.startRow;
    const canClearSelection = selectedRange.endCol > selectedRange.startCol || selectedRange.endRow > selectedRange.startRow;
    const canUnmergeSelection = Boolean(
      selectedMergeRange
      && selectedRange.startRow >= selectedMergeRange.startRow
      && selectedRange.endRow <= selectedMergeRange.endRow
      && selectedRange.startCol >= selectedMergeRange.startCol
      && selectedRange.endCol <= selectedMergeRange.endCol
    );

    if (!canMergeSelection && !canMergeVerticalSelection && !canUnmergeSelection && !canClearSelection) {
      return null;
    }

    const labelRange = canUnmergeSelection ? selectedMergeRange : selectedRange;

    return (
      <div className="table-selection-actions">
        <span className="table-selection-actions__label">
          Seleção {getSpreadsheetColumnLabel(labelRange.startCol)}{labelRange.startRow + 1}:{getSpreadsheetColumnLabel(labelRange.endCol)}{labelRange.endRow + 1}
        </span>
        {canClearSelection && (
          <button
            type="button"
            className="btn-secondary table-builder-toolbar-button table-builder-toolbar-button--remove"
            onClick={() => clearSelectedRange(tableIndex)}
          >
            Apagar células
          </button>
        )}
        {(canMergeSelection || canMergeVerticalSelection) && (
          <button
            type="button"
            className="btn-secondary table-builder-toolbar-button table-builder-toolbar-button--merge"
            onClick={() => applyMergeRange(tableIndex)}
          >
            Mesclar células
          </button>
        )}
        {canUnmergeSelection && (
          <button
            type="button"
            className="btn-secondary table-builder-toolbar-button table-builder-toolbar-button--remove"
            onClick={() => removeMergeRange(tableIndex)}
          >
            Desfazer mescla
          </button>
        )}
        <button
          type="button"
          className="btn-secondary table-builder-toolbar-button table-builder-toolbar-button--remove"
          onClick={clearDragSelection}
        >
          Cancelar seleção
        </button>
      </div>
    );
  };

  const parseBulkTablePaste = (rawText, expectedColumnCount) => {
    const normalizedText = typeof rawText === 'string' ? rawText.replace(/\r/g, '').trim() : '';
    if (!normalizedText) return [];

    const rowChunks = normalizedText
      .split('\n')
      .map((line) => line.split('\t').map((cell) => cell.trim()).filter(Boolean))
      .filter((cells) => cells.length > 0);

    if (rowChunks.length === 0) return [];

    const isRectangularPaste = rowChunks.every((cells) => cells.length === rowChunks[0].length) && rowChunks[0].length > 1;
    if (isRectangularPaste) {
      return rowChunks;
    }

    const flatTokens = normalizedText
      .split(/[\n\t]+/)
      .map((token) => token.trim())
      .filter(Boolean);

    if (flatTokens.length <= 1) return [];

    const columnCount = Math.max(expectedColumnCount || 1, 1);
    const parsedRows = [];

    for (let index = 0; index < flatTokens.length; index += columnCount) {
      parsedRows.push(flatTokens.slice(index, index + columnCount));
    }

    return parsedRows;
  };

  const handleTableCellPaste = (event, tableIndex, rowIndex, colIndex) => {
    const pastedText = event.clipboardData?.getData('text');
    const currentTable = formData.modelTables[tableIndex];
    const parsedRows = parseBulkTablePaste(pastedText, currentTable?.modelTable?.headers.length || 1);

    if (parsedRows.length === 0) {
      return;
    }

    event.preventDefault();

    updateTechnicalTable(tableIndex, (table) => {
      const existingColumnCount = table.modelTable.headers.length;
      const requiredColumnCount = Math.max(
        existingColumnCount,
        colIndex + Math.max(...parsedRows.map((row) => row.length))
      );

      const headers = [...table.modelTable.headers];
      while (headers.length < requiredColumnCount) {
        headers.push(`Nova Coluna ${headers.length + 1}`);
      }

      const rows = table.modelTable.rows.map((row) => {
        const normalizedRow = [...row];
        while (normalizedRow.length < requiredColumnCount) {
          normalizedRow.push('');
        }
        return normalizedRow;
      });

      const requiredRowCount = rowIndex + parsedRows.length;
      while (rows.length < requiredRowCount) {
        rows.push(new Array(requiredColumnCount).fill(''));
      }

      parsedRows.forEach((parsedRow, parsedRowIndex) => {
        parsedRow.forEach((value, parsedColIndex) => {
          rows[rowIndex + parsedRowIndex][colIndex + parsedColIndex] = value;
        });
      });

      return {
        ...table,
        modelTable: { headers, rows }
      };
    });
  };

  const addDynamicSection = () => {
    setFormData((current) => ({
      ...current,
      productTabs: [...current.productTabs, createDynamicSection()]
    }));
  };

  const updateDynamicSection = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      productTabs: current.productTabs.map((section, sectionIndex) => (
        sectionIndex === index ? { ...section, [field]: value } : section
      ))
    }));
  };

  const removeDynamicSection = (index) => {
    setFormData((current) => ({
      ...current,
      productTabs: current.productTabs.filter((_, sectionIndex) => sectionIndex !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (formData.category_ids.length === 0) {
      onValidationError?.('Selecione pelo menos uma categoria principal antes de salvar o produto.');
      return;
    }

    if (previews.length === 0) {
      onValidationError?.('Adicione pelo menos uma foto antes de salvar o produto.');
      return;
    }

    const primaryImageIndex = previews.findIndex((preview) => preview === primaryPreview);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('is_active', String(formData.is_active));
    data.append('description', formData.description);
    data.append('primary_image_index', String(primaryImageIndex >= 0 ? primaryImageIndex : 0));

    const combinedCategoryIds = formData.category_ids;
    const combinedSubCategoryIds = formData.sub_category_ids;
    data.append('category_ids', JSON.stringify(combinedCategoryIds));
    data.append('sub_category_ids', JSON.stringify(combinedSubCategoryIds));

    const extraData = {
      descriptionTabLabel: formData.descriptionTabLabel.trim(),
      descriptionAsList: formData.descriptionAsList,
      technicalTabLabel: formData.technicalTabLabel.trim(),
      product_tabs: formData.productTabs
        .map((section) => ({
          id: section.id,
          title: section.title.trim(),
          content: section.content.trim(),
          contentAsList: section.contentAsList
        }))
        .filter((section) => (
          section.title
          || section.content
        )),
      showFeatures: formData.showFeatures,
      hideModelData: false,
      showModelSection: formData.showModelSection,
      showQuoteButton: formData.showQuoteButton,
      features: formData.showFeatures ? formData.features.filter((f) => f.trim() !== '') : [],
      techSpecs: formData.techSpecs.filter((s) => s.label.trim() !== '' || s.value.trim() !== ''),
      modelTables: formData.modelTables.map((table) => ({
        title: table.title?.trim() || '',
        modelTable: normalizeModelTable({
          ...table.modelTable,
          mergedHeader: Boolean(table.modelTable?.mergedHeader)
        })
      })),
      modelTitle: formData.modelTables[0]?.title || '',
      modelTable: normalizeModelTable(formData.modelTables[0]?.modelTable),
      images: existingImages,
      removedImages: removedExistingImages
    };
    data.append('extra_data', JSON.stringify(extraData));

    formData.images.forEach((img) => {
      data.append('images', img);
    });

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="admin-section-group">
        <span className="section-label">1. Informações Básicas</span>
        <div className="form-group">
          <label>Nome Comercial</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="product-form-options">
          <label className="product-form-option">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            <div>
              <strong>Produto ativo no catalogo</strong>
              <span>Quando desativado, ele some do catálogo e das páginas publicas, mas continua no painel administrativo.</span>
            </div>
          </label>

        </div>

        <div className="product-form-toggle-bar">
          <div className="product-form-toggle-copy">
            <strong>Botão de orçamento</strong>
            <span>
              Status atual: {formData.showQuoteButton ? 'ON' : 'OFF'}
            </span>
          </div>
          <button
            type="button"
            className={`btn-secondary product-form-toggle-button ${formData.showQuoteButton ? 'is-on' : 'is-off'}`}
            onClick={() => setFormData((current) => ({ ...current, showQuoteButton: !current.showQuoteButton }))}
          >
            {formData.showQuoteButton ? 'Desligar orçamento' : 'Ligar orçamento'}
          </button>
        </div>

        <div className="form-group">
          <label>Categorias Principais</label>
          {formData.category_ids.length === 0 && (
            <p className="product-form-helper">
              Selecione pelo menos uma categoria principal para o produto não aparecer como sem categoria.
            </p>
          )}
          <div className="custom-multi-select">
            <div className="multi-select-header" onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}>
              <div className="selected-tags-container">
                {formData.category_ids.length > 0 ? (
                  formData.category_ids.map((id) => (
                    <span key={id} className="header-tag">
                      {mainCategories.find((c) => c.id === id)?.name}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({ ...formData, category_ids: formData.category_ids.filter((cid) => cid !== id) });
                        }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))
                ) : <span className="placeholder">Selecione...</span>}
              </div>
              <ChevronRight size={16} />
            </div>
            {isCategoryDropdownOpen && (
              <div className="multi-select-options">
                {mainCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className={`multi-select-option ${formData.category_ids.includes(cat.id) ? 'selected' : ''}`}
                    onClick={() => {
                      const isSelected = formData.category_ids.includes(cat.id);
                      setFormData({
                        ...formData,
                        category_ids: isSelected
                          ? formData.category_ids.filter((id) => id !== cat.id)
                          : [...formData.category_ids, cat.id]
                      });
                    }}
                  >
                    {cat.name} <CheckCircle className="check-icon" size={16} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {getFilteredSubCategories().length > 0 && (
          <div className="form-group">
            <label>Subcategorias</label>
            <div className="custom-multi-select">
              <div className="multi-select-header" onClick={() => setIsSubCategoryDropdownOpen(!isSubCategoryDropdownOpen)}>
                <div className="selected-tags-container">
                  {formData.sub_category_ids.length > 0 ? (
                    formData.sub_category_ids.map((id) => (
                      <span key={id} className="header-tag">
                        {subCategories.find((c) => c.id === id)?.name}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData({ ...formData, sub_category_ids: formData.sub_category_ids.filter((sid) => sid !== id) });
                          }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))
                  ) : <span className="placeholder">Selecione...</span>}
                </div>
                <ChevronRight size={16} />
              </div>
              {isSubCategoryDropdownOpen && (
                <div className="multi-select-options">
                  {getFilteredSubCategories().map((cat) => (
                    <div
                      key={cat.id}
                      className={`multi-select-option ${formData.sub_category_ids.includes(cat.id) ? 'selected' : ''}`}
                      onClick={() => {
                        const isSelected = formData.sub_category_ids.includes(cat.id);
                        setFormData({
                          ...formData,
                          sub_category_ids: isSelected
                            ? formData.sub_category_ids.filter((id) => id !== cat.id)
                            : [...formData.sub_category_ids, cat.id]
                        });
                      }}
                    >
                      {cat.name} <CheckCircle className="check-icon" size={16} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="admin-section-group">
        <span className="section-label">2. Descrição e Destaques</span>
        <div className="product-form-options">
          <label className="product-form-option">
            <input
              type="checkbox"
              checked={formData.descriptionAsList}
              onChange={(e) => setFormData({ ...formData, descriptionAsList: e.target.checked })}
            />
            <div>
              <strong>Exibir descrição em tópicos</strong>
              <span>Cada linha da descrição vira um item com marcador na página do produto.</span>
            </div>
          </label>

          <label className="product-form-option">
            <input
              type="checkbox"
              checked={formData.showFeatures}
              onChange={(e) => setFormData({ ...formData, showFeatures: e.target.checked })}
            />
            <div>
              <strong>Exibir destaques / diferenciais</strong>
              <span>Ative apenas se quiser mostrar tópicos extras separados da descrição.</span>
            </div>
          </label>

        </div>

        <div className="form-group">
          <label>Descrição</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={
              formData.descriptionAsList
                ? 'Escreva um item por linha para virar um tópico no site'
                : 'Descreva o produto normalmente'
            }
          />
        </div>

        <div className={`form-group ${formData.showFeatures ? '' : 'product-form-group-disabled'}`}>
          <label>Destaques / Diferenciais</label>
          {!formData.showFeatures && (
            <p className="product-form-helper">
              Ative a opção acima se quiser adicionar tópicos extras de destaque para este produto.
            </p>
          )}
          {formData.features.map((feature, index) => (
            <div key={index} className="dynamic-input-group">
              <input
                disabled={!formData.showFeatures}
                value={feature}
                onChange={(e) => {
                  const newFeatures = [...formData.features];
                  newFeatures[index] = e.target.value;
                  setFormData({ ...formData, features: newFeatures });
                }}
              />
              <button
                type="button"
                className="btn-icon delete"
                disabled={!formData.showFeatures}
                onClick={() => setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) })}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn-add"
            disabled={!formData.showFeatures}
            onClick={() => setFormData({ ...formData, features: [...formData.features, ''] })}
          >
            <Plus size={16} /> Adicionar Destaque
          </button>
        </div>
      </div>

      <div className="admin-section-group">
        <span className="section-label">3. Galeria de Fotos</span>
        <div className="file-upload-area">
          <input type="file" multiple accept="image/*" onChange={handleFileChange} />
          <UploadCloud size={40} color="var(--admin-primary)" />
          <p>Clique ou arraste fotos para o produto</p>
        </div>
        {previews.length > 0 && (
          <p className="product-form-helper">
            Escolha qual foto deve ficar como principal. Essa sera a imagem usada na listagem e no detalhe do produto.
          </p>
        )}
        <div className="admin-previews">
          {previews.map((src, idx) => (
            <div key={idx} className={`preview-thumb ${primaryPreview === src ? 'is-primary' : ''}`}>
              <img src={src.startsWith('blob:') ? src : apiAssetPath(src)} alt="Preview" />
              <button
                type="button"
                className={`preview-primary-toggle ${primaryPreview === src ? 'active' : ''}`}
                onClick={() => setPrimaryPreview(src)}
              >
                {primaryPreview === src ? 'Imagem principal' : 'Definir como principal'}
              </button>
              <button type="button" className="remove-preview" onClick={() => removeImage(idx)}><X size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-section-group">
        <span className="section-label">4. Abas do Produto</span>
        <div className="form-group">
          <label>Nome da aba principal</label>
          <input
            type="text"
            value={formData.descriptionTabLabel}
            onChange={(e) => setFormData({ ...formData, descriptionTabLabel: e.target.value })}
            placeholder="Ex.: Descrição Detalhada, Teste123, Visão Geral"
          />
        </div>
        <div className="form-group">
          <label>Abas do produto</label>
          <p className="product-form-helper">
            Adicione quantas abas extras quiser. Cada aba tem um nome e um conteudo proprio para aparecer na pagina do produto.
          </p>
          {formData.productTabs.length === 0 && (
            <p className="product-form-helper">
              Nenhuma aba extra cadastrada ainda. Use o botao abaixo para criar a primeira.
            </p>
          )}
          {formData.productTabs.map((section, index) => (
            <div key={`dynamic-section-${index}`} className="dynamic-section-card">
              <div className="dynamic-section-card__header">
                <strong>Aba extra {index + 1}</strong>
                <button
                  type="button"
                  className="btn-icon delete"
                  onClick={() => removeDynamicSection(index)}
                  aria-label={`Remover aba extra ${index + 1}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="dynamic-section-card__grid">
                <div className="dynamic-section-card__field">
                  <label>Titulo da aba</label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateDynamicSection(index, 'title', e.target.value)}
                    placeholder="Ex.: Teste, Técnico, Aplicações, Benefícios"
                  />
                </div>
              </div>

              <label className="product-form-option dynamic-section-card__toggle">
                <input
                  type="checkbox"
                  checked={section.contentAsList}
                  onChange={(e) => updateDynamicSection(index, 'contentAsList', e.target.checked)}
                />
                <div>
                  <strong>Exibir conteúdo em tópicos</strong>
                  <span>Cada linha do texto vira um item listado dentro desta aba.</span>
                </div>
              </label>

              <div className="dynamic-section-card__field">
                <label>Conteúdo da aba</label>
                <textarea
                  value={section.content}
                  onChange={(e) => updateDynamicSection(index, 'content', e.target.value)}
                  placeholder={
                    section.contentAsList
                      ? 'Escreva um item por linha para montar a lista desta aba'
                      : 'Escreva o conteúdo que será mostrado ao clicar nesta aba'
                  }
                />
              </div>
            </div>
          ))}

          <button type="button" className="btn-add" onClick={addDynamicSection}>
            <Plus size={16} /> Adicionar Aba Extra
          </button>
        </div>
      </div>

      <div className="admin-section-group">
        <span className="section-label">5. Configuração da Tabela</span>
        <div className="table-title-group table-title-group--split">
          <div className="form-group">
          <label>Nome da aba técnica</label>
          <input
            value={formData.technicalTabLabel}
            placeholder="Ex.: Informação Técnica, Técnico, Especificações"
            onChange={(e) => setFormData({ ...formData, technicalTabLabel: e.target.value })}
          />
          </div>

          <div className="form-group">
          <label>Título da Tabela</label>
          <p className="product-form-helper">
            Defina o nome que sera exibido acima da tabela técnica do produto.
          </p>
          <input
            value={formData.modelTables[0]?.title || ''}
            placeholder="Ex.: Tabela Técnica / Modelos Disponíveis"
            onChange={(e) => updateTechnicalTableTitle(0, e.target.value)}
          />
          </div>
        </div>

        <div
          className={[
            'table-builder-container',
            isTableSizeOpen ? 'table-builder-container--size-open' : ''
          ].filter(Boolean).join(' ')}
        >
          <div className="table-builder-toolbar">
            <div className="table-builder-toolbar-copy">
              <span className="table-builder-kicker">Configuração da tabela</span>
              <h4>Organize colunas e linhas com mais clareza</h4>
              <p>Cadastre os títulos principais e preencha as informações técnicas que serão exibidas no site.</p>
            </div>
            <div className="table-builder-toolbar-actions">
              {/* Dropdown: Tamanho da Grade */}
              <div className="table-config-icon-dropdown">
                <button
                  type="button"
                  className={`table-config-icon-trigger ${isTableSizeOpen ? 'is-active' : ''}`}
                  onClick={() => setIsTableSizeOpen(!isTableSizeOpen)}
                  title="Ajustar Tamanho da Grade"
                >
                  <Table size={20} />
                </button>

                {isTableSizeOpen && (
                  <div className="multi-select-options table-config-dropdown-panel">
                    <div
                      className="table-size-picker"
                      onMouseLeave={() => clearTablePickerPreview(0, formData.modelTables[0].modelTable.rows.length, formData.modelTables[0].modelTable.headers.length)}
                    >
                      <span className="table-size-picker__label">Criar grade visual</span>
                      <div className="table-size-picker__grid">
                        {Array.from({ length: 8 }).map((_, rowIndex) => (
                          Array.from({ length: 8 }).map((__, columnIndex) => {
                            const preview = tablePickerPreview[0] || {
                              rows: formData.modelTables[0].modelTable.rows.length,
                              columns: formData.modelTables[0].modelTable.headers.length
                            };
                            const isActive = rowIndex < preview.rows && columnIndex < preview.columns;

                            return (
                              <button
                                key={`picker-main-${rowIndex}-${columnIndex}`}
                                type="button"
                                className={`table-size-picker__cell ${isActive ? 'is-active' : ''}`}
                                onMouseEnter={() => updateTablePickerPreview(0, rowIndex + 1, columnIndex + 1)}
                                onFocus={() => updateTablePickerPreview(0, rowIndex + 1, columnIndex + 1)}
                                onClick={() => resizeTable(0, rowIndex + 1, columnIndex + 1)}
                                aria-label={`Criar tabela ${rowIndex + 1} por ${columnIndex + 1}`}
                              />
                            );
                          })
                        ))}
                      </div>
                      <span className="table-size-picker__summary">
                        {(tablePickerPreview[0]?.rows || formData.modelTables[0].modelTable.rows.length)} x {(tablePickerPreview[0]?.columns || formData.modelTables[0].modelTable.headers.length)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="table-builder-scroll-wrapper">
            <table className="builder-table" style={{ '--table-column-count': formData.modelTables[0].modelTable.headers.length }}>
              <colgroup>
                <col className="builder-table__col-number" />
                {formData.modelTables[0].modelTable.headers.map((_, hIdx) => (
                  <col key={`main-col-${hIdx}`} className="builder-table__col-data" />
                ))}
                <col className="builder-table__col-action" />
              </colgroup>
              <thead>
                <tr className="builder-table__sheet-row builder-table__sheet-row--labels">
                  <th className="builder-table__corner-cell" aria-hidden="true" />
                  {formData.modelTables[0].modelTable.headers.map((_, hIdx) => (
                    <th key={`sheet-label-${hIdx}`} className="builder-table__sheet-label">
                      {getSpreadsheetColumnLabel(hIdx)}
                    </th>
                  ))}
                  <th className="table-action-spacer table-action-spacer--adder">
                    <button
                      type="button"
                      className="table-grid-plus"
                      onClick={() => addTableHeader(0)}
                      aria-label="Adicionar coluna"
                    >
                      <Plus size={14} />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="builder-table__row-number">1</td>
                  {renderBuilderCells({
                    tableIndex: 0,
                    rowNumber: 1,
                    values: formData.modelTables[0].modelTable.headers,
                    isHeaderRow: true
                  })}
                  <td className="table-action-cell table-action-cell--adder">
                    <button
                      type="button"
                      className="table-grid-plus"
                      onClick={() => addTableRow(0)}
                      aria-label="Adicionar linha"
                    >
                      <Plus size={14} />
                    </button>
                  </td>
                </tr>
                {formData.modelTables[0].modelTable.rows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td className="builder-table__row-number">{rIdx + 2}</td>
                      {renderBuilderCells({
                        tableIndex: 0,
                        rowNumber: rIdx + 2,
                        values: row
                      })}
                      <td className="table-action-cell"><button type="button" className="btn-icon delete" onClick={() => removeTableRow(0, rIdx)}><Trash2 size={16} /></button></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {renderSelectionActions(0)}
        </div>

        {formData.modelTables.slice(1).map((tableConfig, extraIndex) => {
          const tableIndex = extraIndex + 1;

          return (
            <div key={`technical-table-${tableIndex}`} className="table-builder-container">
              <div className="dynamic-section-card__header">
                <strong>Tabela {tableIndex + 1}</strong>
                <button
                  type="button"
                  className="btn-icon delete"
                  onClick={() => removeTechnicalTable(tableIndex)}
                  aria-label={`Remover tabela ${tableIndex + 1}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="form-group table-title-group">
                <label>Titulo da Tabela</label>
                <p className="product-form-helper">
                  Defina o nome que será exibido acima desta tabela técnica do produto.
                </p>
                <input
                  value={tableConfig.title}
                  placeholder="Ex.: Tabela Técnica / Modelos Disponíveis"
                  onChange={(e) => updateTechnicalTableTitle(tableIndex, e.target.value)}
                />
              </div>

              <div className="table-builder-toolbar">
                <div className="table-builder-toolbar-copy">
                  <span className="table-builder-kicker">Configuração da tabela</span>
                  <h4>Organize colunas e linhas com mais clareza</h4>
                  <p>Cadastre os títulos principais e preencha as informações técnicas que serão exibidas no site.</p>
                </div>
                <div
                  className="table-size-picker"
                  onMouseLeave={() => clearTablePickerPreview(tableIndex, tableConfig.modelTable.rows.length, tableConfig.modelTable.headers.length)}
                >
                  <span className="table-size-picker__label">Criar grade visual</span>
                  <div className="table-size-picker__grid">
                    {Array.from({ length: 8 }).map((_, rowIndex) => (
                      Array.from({ length: 8 }).map((__, columnIndex) => {
                        const preview = tablePickerPreview[tableIndex] || {
                          rows: tableConfig.modelTable.rows.length,
                          columns: tableConfig.modelTable.headers.length
                        };
                        const isActive = rowIndex < preview.rows && columnIndex < preview.columns;

                        return (
                          <button
                            key={`picker-${tableIndex}-${rowIndex}-${columnIndex}`}
                            type="button"
                            className={`table-size-picker__cell ${isActive ? 'is-active' : ''}`}
                            onMouseEnter={() => updateTablePickerPreview(tableIndex, rowIndex + 1, columnIndex + 1)}
                            onFocus={() => updateTablePickerPreview(tableIndex, rowIndex + 1, columnIndex + 1)}
                            onClick={() => resizeTable(tableIndex, rowIndex + 1, columnIndex + 1)}
                            aria-label={`Criar tabela ${rowIndex + 1} por ${columnIndex + 1}`}
                          />
                        );
                      })
                    ))}
                  </div>
                  <span className="table-size-picker__summary">
                    {(tablePickerPreview[tableIndex]?.rows || tableConfig.modelTable.rows.length)} x {(tablePickerPreview[tableIndex]?.columns || tableConfig.modelTable.headers.length)}
                  </span>
                </div>
              </div>

              <div className="table-builder-scroll-wrapper">
                <table className="builder-table" style={{ '--table-column-count': tableConfig.modelTable.headers.length }}>
                  <colgroup>
                    <col className="builder-table__col-number" />
                    {tableConfig.modelTable.headers.map((_, hIdx) => (
                      <col key={`extra-col-${tableIndex}-${hIdx}`} className="builder-table__col-data" />
                    ))}
                    <col className="builder-table__col-action" />
                  </colgroup>
                  <thead>
                    <tr className="builder-table__sheet-row builder-table__sheet-row--labels">
                      <th className="builder-table__corner-cell" aria-hidden="true" />
                      {tableConfig.modelTable.headers.map((_, hIdx) => (
                        <th key={`sheet-label-${tableIndex}-${hIdx}`} className="builder-table__sheet-label">
                          {getSpreadsheetColumnLabel(hIdx)}
                        </th>
                      ))}
                      <th className="table-action-spacer table-action-spacer--adder">
                        <button
                          type="button"
                          className="table-grid-plus"
                          onClick={() => addTableHeader(tableIndex)}
                          aria-label={`Adicionar coluna na tabela ${tableIndex + 1}`}
                        >
                          <Plus size={14} />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="builder-table__row-number">1</td>
                      {renderBuilderCells({
                        tableIndex,
                        rowNumber: 1,
                        values: tableConfig.modelTable.headers,
                        isHeaderRow: true
                      })}
                      <td className="table-action-cell table-action-cell--adder">
                        <button
                          type="button"
                          className="table-grid-plus"
                          onClick={() => addTableRow(tableIndex)}
                          aria-label={`Adicionar linha na tabela ${tableIndex + 1}`}
                        >
                          <Plus size={14} />
                        </button>
                      </td>
                    </tr>
                    {tableConfig.modelTable.rows.map((row, rIdx) => (
                        <tr key={rIdx}>
                          <td className="builder-table__row-number">{rIdx + 2}</td>
                          {renderBuilderCells({
                            tableIndex,
                            rowNumber: rIdx + 2,
                            values: row
                          })}
                          <td className="table-action-cell"><button type="button" className="btn-icon delete" onClick={() => removeTableRow(tableIndex, rIdx)}><Trash2 size={16} /></button></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {renderSelectionActions(tableIndex)}
            </div>
          );
        })}

        <button type="button" className="btn-add" onClick={addTechnicalTable}>
          <Plus size={16} /> Adicionar Nova Tabela
        </button>

        <div className="product-form-toggle-bar table-config-visibility-toggle">
          <div className="product-form-toggle-copy">
            <strong>Exibir tabela no site</strong>
            <span>Status atual: {formData.showModelSection ? 'ON' : 'OFF'}</span>
          </div>
          <button
            type="button"
            className={`btn-secondary product-form-toggle-button ${formData.showModelSection ? 'is-on' : 'is-off'}`}
            onClick={() => setFormData((current) => ({ ...current, showModelSection: !current.showModelSection }))}
          >
            {formData.showModelSection ? 'Ocultar no site' : 'Exibir no site'}
          </button>
        </div>
      </div>

      <div className="product-form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>Cancelar</button>
        <button type="submit" className="btn-primary product-submit-button" disabled={isSubmitting}>
          {isSubmitting ? <ButtonSavingIndicator /> : <Save size={20} />}
          {isSubmitting ? 'Salvando' : 'Finalizar e salvar produto'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
