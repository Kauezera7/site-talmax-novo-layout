import React, { useState, useEffect } from 'react';
import {
  Plus, Minus, Trash2, Save, X, UploadCloud, ChevronRight, CheckCircle
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
  singleCellFirstRow: false,
  showQuoteButton: true,
  images: [],
  features: [''],
  techSpecs: [{ label: '', value: '' }],
  modelTitle: '',
  modelTable: { headers: ['Tipo / Referencia', 'Codigo'], rows: [['', '']] }
});

const createEmptyModelTable = () => ({
  headers: ['Tipo / Referencia', 'Codigo'],
  rows: [['', '']]
});

const createDynamicSection = () => ({
  title: '',
  content: '',
  contentAsList: false,
  type: 'content',
  showModelSection: true,
  hideModelData: false,
  singleCellFirstRow: false,
  modelTitle: '',
  modelTable: createEmptyModelTable()
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
    : fallback.rows.map((row) => [...row]);

  return { headers, rows };
};

const normalizeDynamicSections = (sections) => (
  Array.isArray(sections)
    ? sections.map((section) => ({
      title: typeof section?.title === 'string' ? section.title : '',
      content: typeof section?.content === 'string' ? section.content : '',
      contentAsList: Boolean(section?.contentAsList),
      type: section?.type === 'table' ? 'table' : 'content',
      showModelSection: section?.showModelSection !== false,
      hideModelData: Boolean(section?.hideModelData),
      singleCellFirstRow: Boolean(section?.singleCellFirstRow),
      modelTitle: typeof section?.modelTitle === 'string' ? section.modelTitle : '',
      modelTable: normalizeModelTable(section?.modelTable)
    }))
    : []
);

const normalizeProductTabs = (tabs, legacySections = []) => {
  if (Array.isArray(tabs) && tabs.length > 0) {
    return tabs.map((tab) => ({
      id: tab?.id,
      title: typeof tab?.title === 'string' ? tab.title : '',
      content: typeof tab?.content === 'string' ? tab.content : '',
      contentAsList: Boolean(tab?.contentAsList || tab?.content_as_list),
      type: tab?.type === 'table' ? 'table' : 'content',
      showModelSection: tab?.showModelSection !== false,
      hideModelData: Boolean(tab?.hideModelData),
      singleCellFirstRow: Boolean(tab?.singleCellFirstRow),
      modelTitle: typeof tab?.modelTitle === 'string' ? tab.modelTitle : '',
      modelTable: normalizeModelTable(tab?.modelTable)
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
        hideModelData: extra.hideModelData || false,
        showModelSection: extra.showModelSection !== false,
        singleCellFirstRow: Boolean(extra.singleCellFirstRow),
        showQuoteButton: extra.showQuoteButton !== false,
        images: [],
        features: (extra.features && extra.features.length > 0) ? extra.features : [''],
        techSpecs: (extra.techSpecs && extra.techSpecs.length > 0) ? extra.techSpecs : [{ label: '', value: '' }],
        modelTitle: extra.modelTitle || '',
        modelTable: extra.modelTable || { headers: ['Tipo / Referência', 'Código'], rows: [['', '']] }
      });

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

  const addTableHeader = () => {
    const newHeaders = [...formData.modelTable.headers, 'Nova Coluna'];
    const newRows = formData.modelTable.rows.map((row) => [...row, '']);
    setFormData({ ...formData, modelTable: { headers: newHeaders, rows: newRows } });
  };

  const removeTableHeader = (index) => {
    if (formData.modelTable.headers.length <= 1) return;
    const newHeaders = formData.modelTable.headers.filter((_, i) => i !== index);
    const newRows = formData.modelTable.rows.map((row) => row.filter((_, i) => i !== index));
    setFormData({ ...formData, modelTable: { headers: newHeaders, rows: newRows } });
  };

  const removeLastTableHeader = () => {
    if (formData.modelTable.headers.length <= 1) return;
    removeTableHeader(formData.modelTable.headers.length - 1);
  };

  const updateTableHeader = (index, value) => {
    setFormData((current) => {
      const newHeaders = [...current.modelTable.headers];
      newHeaders[index] = value;
      return { ...current, modelTable: { ...current.modelTable, headers: newHeaders } };
    });
  };

  const addTableRow = () => {
    const newRow = new Array(formData.modelTable.headers.length).fill('');
    setFormData({ ...formData, modelTable: { ...formData.modelTable, rows: [...formData.modelTable.rows, newRow] } });
  };

  const removeTableRow = (index) => {
    if (formData.modelTable.rows.length <= 1) return;
    const newRows = formData.modelTable.rows.filter((_, i) => i !== index);
    setFormData({ ...formData, modelTable: { ...formData.modelTable, rows: newRows } });
  };

  const updateTableCell = (rowIndex, colIndex, value) => {
    setFormData((current) => {
      const newRows = current.modelTable.rows.map((row) => [...row]);
      newRows[rowIndex][colIndex] = value;
      return { ...current, modelTable: { ...current.modelTable, rows: newRows } };
    });
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

  const handleTableCellPaste = (event, rowIndex, colIndex) => {
    const pastedText = event.clipboardData?.getData('text');
    const parsedRows = parseBulkTablePaste(pastedText, formData.modelTable.headers.length);

    if (parsedRows.length === 0) {
      return;
    }

    event.preventDefault();

    setFormData((current) => {
      const existingColumnCount = current.modelTable.headers.length;
      const requiredColumnCount = Math.max(
        existingColumnCount,
        colIndex + Math.max(...parsedRows.map((row) => row.length))
      );

      const headers = [...current.modelTable.headers];
      while (headers.length < requiredColumnCount) {
        headers.push(`Nova Coluna ${headers.length + 1}`);
      }

      const rows = current.modelTable.rows.map((row) => {
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
        ...current,
        modelTable: {
          headers,
          rows
        }
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

  const updateDynamicSectionTable = (sectionIndex, updater) => {
    setFormData((current) => ({
      ...current,
      productTabs: current.productTabs.map((section, currentIndex) => {
        if (currentIndex !== sectionIndex) {
          return section;
        }

        return {
          ...section,
          modelTable: updater(normalizeModelTable(section.modelTable))
        };
      })
    }));
  };

  const addDynamicSectionTableHeader = (sectionIndex) => {
    updateDynamicSectionTable(sectionIndex, (modelTable) => ({
      headers: [...modelTable.headers, 'Nova Coluna'],
      rows: modelTable.rows.map((row) => [...row, ''])
    }));
  };

  const removeDynamicSectionTableHeader = (sectionIndex, headerIndex) => {
    updateDynamicSectionTable(sectionIndex, (modelTable) => {
      if (modelTable.headers.length <= 1) {
        return modelTable;
      }

      return {
        headers: modelTable.headers.filter((_, currentIndex) => currentIndex !== headerIndex),
        rows: modelTable.rows.map((row) => row.filter((_, currentIndex) => currentIndex !== headerIndex))
      };
    });
  };

  const removeLastDynamicSectionTableHeader = (sectionIndex) => {
    const section = formData.productTabs[sectionIndex];
    if (!section?.modelTable?.headers?.length) {
      return;
    }

    removeDynamicSectionTableHeader(sectionIndex, section.modelTable.headers.length - 1);
  };

  const updateDynamicSectionTableHeader = (sectionIndex, headerIndex, value) => {
    updateDynamicSectionTable(sectionIndex, (modelTable) => {
      const headers = [...modelTable.headers];
      headers[headerIndex] = value;
      return { ...modelTable, headers };
    });
  };

  const addDynamicSectionTableRow = (sectionIndex) => {
    updateDynamicSectionTable(sectionIndex, (modelTable) => ({
      ...modelTable,
      rows: [...modelTable.rows, new Array(modelTable.headers.length).fill('')]
    }));
  };

  const removeDynamicSectionTableRow = (sectionIndex, rowIndex) => {
    updateDynamicSectionTable(sectionIndex, (modelTable) => {
      if (modelTable.rows.length <= 1) {
        return modelTable;
      }

      return {
        ...modelTable,
        rows: modelTable.rows.filter((_, currentIndex) => currentIndex !== rowIndex)
      };
    });
  };

  const updateDynamicSectionTableCell = (sectionIndex, rowIndex, colIndex, value) => {
    updateDynamicSectionTable(sectionIndex, (modelTable) => {
      const rows = modelTable.rows.map((row) => [...row]);
      rows[rowIndex][colIndex] = value;
      return { ...modelTable, rows };
    });
  };

  const handleDynamicSectionTablePaste = (event, sectionIndex, rowIndex, colIndex) => {
    const pastedText = event.clipboardData?.getData('text');
    const section = formData.productTabs[sectionIndex];
    const parsedRows = parseBulkTablePaste(pastedText, section?.modelTable?.headers?.length || 1);

    if (parsedRows.length === 0) {
      return;
    }

    event.preventDefault();

    updateDynamicSectionTable(sectionIndex, (modelTable) => {
      const requiredColumnCount = Math.max(
        modelTable.headers.length,
        colIndex + Math.max(...parsedRows.map((row) => row.length))
      );

      const headers = [...modelTable.headers];
      while (headers.length < requiredColumnCount) {
        headers.push(`Nova Coluna ${headers.length + 1}`);
      }

      const rows = modelTable.rows.map((row) => {
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

      return { headers, rows };
    });
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
          type: section.type === 'table' ? 'table' : 'content',
          content: section.content.trim(),
          contentAsList: section.contentAsList,
          showModelSection: section.showModelSection !== false,
          hideModelData: Boolean(section.hideModelData),
          singleCellFirstRow: Boolean(section.singleCellFirstRow),
          modelTitle: section.modelTitle?.trim() || '',
          modelTable: normalizeModelTable(section.modelTable)
        }))
        .filter((section) => (
          section.title
          || section.content
          || section.type === 'table'
        )),
      showFeatures: formData.showFeatures,
      hideModelData: formData.hideModelData,
      showModelSection: formData.showModelSection,
      singleCellFirstRow: formData.singleCellFirstRow,
      showQuoteButton: formData.showQuoteButton,
      features: formData.showFeatures ? formData.features.filter((f) => f.trim() !== '') : [],
      techSpecs: formData.techSpecs.filter((s) => s.label.trim() !== '' || s.value.trim() !== ''),
      modelTitle: formData.modelTitle,
      modelTable: formData.modelTable,
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
              <span>Quando desativado, ele some do catalogo e das paginas publicas, mas continua no painel administrativo.</span>
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
            placeholder="Ex.: Descricao Detalhada, Teste123, Visao Geral"
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
                    placeholder="Ex.: Teste, Tecnico, Aplicacoes, Beneficios"
                  />
                </div>
                <label className="product-form-option dynamic-section-card__toggle">
                  <input
                    type="checkbox"
                    checked={section.type === 'table'}
                    onChange={(e) => updateDynamicSection(index, 'type', e.target.checked ? 'table' : 'content')}
                  />
                  <div>
                    <strong>Esta aba exibe tabela</strong>
                    <span>Ative para transformar esta aba em uma tabela completa, igual a configuração da tabela principal.</span>
                  </div>
                </label>
              </div>

              {section.type === 'table' ? (
                <div className="dynamic-section-card__table-builder">
                  <div className="product-form-options">
                    <label className="product-form-option">
                      <input
                        type="checkbox"
                        checked={section.showModelSection !== false}
                        onChange={(e) => updateDynamicSection(index, 'showModelSection', e.target.checked)}
                      />
                      <div>
                        <strong>Exibir tabela no site</strong>
                        <span>Desmarque se quiser salvar a tabela no painel, mas esconder a seção na página do produto.</span>
                      </div>
                    </label>

                    <label className="product-form-option">
                      <input
                        type="checkbox"
                        checked={Boolean(section.hideModelData)}
                        disabled={section.showModelSection === false}
                        onChange={(e) => updateDynamicSection(index, 'hideModelData', e.target.checked)}
                      />
                      <div>
                        <strong>Mostrar apenas o cabeçalho</strong>
                        <span>Exibe só os títulos das colunas da tabela e oculta todas as linhas de dados.</span>
                      </div>
                    </label>

                    <label className="product-form-option">
                      <input
                        type="checkbox"
                        checked={Boolean(section.singleCellFirstRow)}
                        disabled={section.showModelSection === false || Boolean(section.hideModelData)}
                        onChange={(e) => updateDynamicSection(index, 'singleCellFirstRow', e.target.checked)}
                      />
                      <div>
                        <strong>Primeira linha em célula única</strong>
                        <span>Faz o cabeçalho da tabela ocupar todas as colunas com um único campo.</span>
                      </div>
                    </label>
                  </div>

                  <div className={`table-builder-container ${section.showModelSection === false ? 'product-form-group-disabled' : ''}`}>
                    <div className="form-group table-title-group">
                      <label>Título da Tabela</label>
                      <p className="product-form-helper">
                        Defina o nome que será exibido acima desta tabela dentro da aba.
                      </p>
                      <input
                        value={section.modelTitle}
                        placeholder="Ex.: Tabela Tecnica / Modelos Disponiveis"
                        onChange={(e) => updateDynamicSection(index, 'modelTitle', e.target.value)}
                      />
                    </div>

                    <div className="table-builder-toolbar">
                      <div className="table-builder-toolbar-copy">
                        <span className="table-builder-kicker">Configuração da tabela</span>
                        <h4>Organize colunas e linhas com mais clareza</h4>
                        <p>Cadastre os títulos principais e preencha as informações técnicas que serão exibidas nesta aba.</p>
                      </div>
                      <div className="table-builder-toolbar-actions">
                        <button
                          disabled={section.showModelSection === false || section.modelTable.headers.length <= 1}
                          type="button"
                          className="btn-secondary table-builder-toolbar-button table-builder-toolbar-button--remove"
                          onClick={() => removeLastDynamicSectionTableHeader(index)}
                        >
                          <Minus size={16} /> Remover Coluna
                        </button>
                        <button
                          disabled={section.showModelSection === false}
                          type="button"
                          className="btn-add table-builder-toolbar-button table-builder-toolbar-button--add"
                          onClick={() => addDynamicSectionTableHeader(index)}
                        >
                          <Plus size={16} /> Adicionar Coluna
                        </button>
                      </div>
                    </div>

                    <table className="builder-table" style={{ '--table-column-count': normalizeModelTable(section.modelTable).headers.length }}>
                      <thead>
                        <tr>
                          {section.singleCellFirstRow ? (
                            <th colSpan={normalizeModelTable(section.modelTable).headers.length} className="builder-table__single-cell-row">
                              <div>
                                <input
                                  disabled={section.showModelSection === false}
                                  value={normalizeModelTable(section.modelTable).headers[0] || ''}
                                  onChange={(e) => updateDynamicSectionTableHeader(index, 0, e.target.value)}
                                />
                                <button
                                  disabled={section.showModelSection === false}
                                  type="button"
                                  className="table-remove-button"
                                  onClick={() => updateDynamicSectionTableHeader(index, 0, '')}
                                  aria-label={`Limpar cabeçalho da aba ${index + 1}`}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </th>
                          ) : (
                            normalizeModelTable(section.modelTable).headers.map((header, hIdx) => (
                              <th key={hIdx}>
                                <div>
                                  <input
                                    disabled={section.showModelSection === false}
                                    value={header}
                                    onChange={(e) => updateDynamicSectionTableHeader(index, hIdx, e.target.value)}
                                  />
                                  <button
                                    disabled={section.showModelSection === false}
                                    type="button"
                                    className="table-remove-button"
                                    onClick={() => removeDynamicSectionTableHeader(index, hIdx)}
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </th>
                            ))
                          )}
                          <th className="table-action-spacer" aria-hidden="true" />
                        </tr>
                      </thead>
                      {!section.hideModelData && (
                        <tbody>
                          {normalizeModelTable(section.modelTable).rows.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx}>
                                  <textarea
                                    disabled={section.showModelSection === false}
                                    value={cell}
                                    onChange={(e) => {
                                      updateDynamicSectionTableCell(index, rIdx, cIdx, e.target.value);
                                      autoResizeTableTextarea(e.target);
                                    }}
                                    onPaste={(e) => handleDynamicSectionTablePaste(e, index, rIdx, cIdx)}
                                    rows={3}
                                    style={{ height: '48px' }}
                                    ref={(element) => autoResizeTableTextarea(element)}
                                  />
                                </td>
                              ))}
                              <td className="table-action-cell">
                                <button
                                  disabled={section.showModelSection === false}
                                  type="button"
                                  className="btn-icon delete"
                                  onClick={() => removeDynamicSectionTableRow(index, rIdx)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      )}
                    </table>

                    {section.hideModelData ? (
                      <p className="product-form-helper">
                        As linhas ficaram ocultas no painel porque esta tabela está configurada para mostrar apenas o cabeçalho no site.
                      </p>
                    ) : (
                      <button
                        disabled={section.showModelSection === false}
                        type="button"
                        className="btn-add"
                        onClick={() => addDynamicSectionTableRow(index)}
                      >
                        <Plus size={16} /> Adicionar Linha
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          ))}

          <button type="button" className="btn-add" onClick={addDynamicSection}>
            <Plus size={16} /> Adicionar Aba Extra
          </button>
        </div>
      </div>

      <div className="admin-section-group">
        <span className="section-label">5. Configuração da Tabela</span>
        <div className="product-form-options">
          <label className="product-form-option">
            <input
              type="checkbox"
              checked={formData.showModelSection}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  showModelSection: e.target.checked
                })
              }
            />
            <div>
              <strong>Exibir tabela no site</strong>
              <span>Desmarque se quiser salvar a tabela no painel, mas esconder a seção na página do produto.</span>
            </div>
          </label>

          <label className="product-form-option">
            <input
              type="checkbox"
              checked={formData.hideModelData}
              disabled={!formData.showModelSection}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  hideModelData: e.target.checked
                })
              }
            />
            <div>
              <strong>Mostrar apenas o cabeçalho</strong>
              <span>Exibe só os títulos das colunas da tabela e oculta todas as linhas de dados.</span>
            </div>
          </label>

          <label className="product-form-option">
            <input
              type="checkbox"
              checked={formData.singleCellFirstRow}
              disabled={!formData.showModelSection || formData.hideModelData}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  singleCellFirstRow: e.target.checked
                })
              }
            />
            <div>
              <strong>Primeira linha em célula única</strong>
              <span>Faz o cabeçalho da tabela ocupar todas as colunas com um único campo.</span>
            </div>
          </label>
        </div>

        <div className="form-group table-title-group">
          <label>Nome da aba tecnica</label>
          <input
            value={formData.technicalTabLabel}
            placeholder="Ex.: Informacao Tecnica, Tecnico, Especificacoes"
            onChange={(e) => setFormData({ ...formData, technicalTabLabel: e.target.value })}
          />
        </div>

        <div className="form-group table-title-group">
          <label>Título da Tabela</label>
          <p className="product-form-helper">
            Defina o nome que sera exibido acima da tabela tecnica do produto.
          </p>
          <input
            value={formData.modelTitle}
            placeholder="Ex.: Tabela Tecnica / Modelos Disponiveis"
            onChange={(e) => setFormData({ ...formData, modelTitle: e.target.value })}
          />
        </div>

        <div className={`table-builder-container ${formData.showModelSection ? '' : 'product-form-group-disabled'}`}>
          <div className="table-builder-toolbar">
            <div className="table-builder-toolbar-copy">
              <span className="table-builder-kicker">Configuração da tabela</span>
              <h4>Organize colunas e linhas com mais clareza</h4>
              <p>Cadastre os títulos principais e preencha as informações técnicas que serão exibidas no site.</p>
            </div>
            <div className="table-builder-toolbar-actions">
              <button
                disabled={!formData.showModelSection || formData.modelTable.headers.length <= 1}
                type="button"
                className="btn-secondary table-builder-toolbar-button"
                onClick={removeLastTableHeader}
              >
                <Minus size={16} /> Remover Coluna
              </button>
              <button
                disabled={!formData.showModelSection}
                type="button"
                className="btn-add table-builder-toolbar-button"
                onClick={addTableHeader}
              >
                <Plus size={16} /> Adicionar Coluna
              </button>
            </div>
          </div>
          <table className="builder-table" style={{ '--table-column-count': formData.modelTable.headers.length }}>
            <thead>
              <tr>
                {formData.singleCellFirstRow ? (
                  <th colSpan={formData.modelTable.headers.length} className="builder-table__single-cell-row">
                    <div>
                      <input
                        disabled={!formData.showModelSection}
                        value={formData.modelTable.headers[0] || ''}
                        onChange={(e) => updateTableHeader(0, e.target.value)}
                      />
                      <button
                        disabled={!formData.showModelSection}
                        type="button"
                        className="table-remove-button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={() => updateTableHeader(0, '')}
                        aria-label="Limpar cabeçalho da tabela"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </th>
                ) : (
                  formData.modelTable.headers.map((header, hIdx) => (
                    <th key={hIdx}>
                      <div>
                        <input disabled={!formData.showModelSection} value={header} onChange={(e) => updateTableHeader(hIdx, e.target.value)} />
                        <button disabled={!formData.showModelSection} type="button" className="table-remove-button" onClick={() => removeTableHeader(hIdx)}><X size={14} /></button>
                      </div>
                    </th>
                  ))
                )}
                <th className="table-action-spacer" aria-hidden="true" />
              </tr>
            </thead>
            {!formData.hideModelData && (
              <tbody>
                {formData.modelTable.rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx}>
                        <textarea
                          disabled={!formData.showModelSection}
                          value={cell}
                          onChange={(e) => {
                            updateTableCell(rIdx, cIdx, e.target.value);
                            autoResizeTableTextarea(e.target);
                          }}
                          onPaste={(e) => handleTableCellPaste(e, rIdx, cIdx)}
                          rows={3}
                          style={{ height: '48px' }}
                          ref={(element) => autoResizeTableTextarea(element)}
                        />
                      </td>
                    ))}
                    <td className="table-action-cell"><button disabled={!formData.showModelSection} type="button" className="btn-icon delete" onClick={() => removeTableRow(rIdx)}><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
          {formData.hideModelData ? (
            <p className="product-form-helper">
              As linhas ficaram ocultas no painel porque esta tabela está configurada para mostrar apenas o cabeçalho no site.
            </p>
          ) : (
            <button disabled={!formData.showModelSection} type="button" className="btn-add" onClick={addTableRow}><Plus size={16} /> Adicionar Linha</button>
          )}
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
