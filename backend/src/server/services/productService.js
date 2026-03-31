/**
 * Centraliza a logica de consulta e relacionamento dos produtos.
 * Mantem as rotas menores e reaproveita SQL e transformacoes repetidas.
 */
const PRODUCT_SELECT_QUERY = `
  SELECT p.*,
         (SELECT GROUP_CONCAT(name SEPARATOR ', ') FROM (
             SELECT name, product_id FROM categorias c JOIN product_categorias pc ON c.id = pc.category_id
             UNION ALL
             SELECT name, product_id FROM sub_categorias sc JOIN product_sub_categorias psc ON sc.id = psc.sub_category_id
         ) as combined WHERE combined.product_id = p.id) as category_names,
         (SELECT GROUP_CONCAT(category_id) FROM product_categorias WHERE product_id = p.id) as main_category_ids,
         (SELECT GROUP_CONCAT(sub_category_id) FROM product_sub_categorias WHERE product_id = p.id) as sub_category_ids
  FROM products p
`;

const PRODUCT_TABS_TABLE_QUERY = `
  CREATE TABLE IF NOT EXISTS product_tabs (
    id INT NOT NULL AUTO_INCREMENT,
    product_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT DEFAULT NULL,
    content_as_list BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_product_tabs_product_id (product_id),
    KEY idx_product_tabs_display_order (display_order),
    CONSTRAINT fk_product_tabs_product
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  )
`;

let productTabsTableReady = false;

const normalizeProductTabRow = (row) => ({
  id: Number(row.id),
  product_id: Number(row.product_id),
  title: row.title || '',
  content: row.content || '',
  content_as_list: Number(row.content_as_list ?? 0) === 1 || row.content_as_list === true,
  display_order: Number(row.display_order || 0),
  is_active: Number(row.is_active ?? 1) === 1
});

const ensureProductTabsTable = async (db) => {
  if (productTabsTableReady) {
    return;
  }

  await db.query(PRODUCT_TABS_TABLE_QUERY);
  productTabsTableReady = true;
};

const normalizeIncomingTabs = (tabs = []) => (
  Array.isArray(tabs)
    ? tabs
      .map((tab, index) => ({
        title: String(tab?.title || '').trim(),
        content: String(tab?.content || '').trim(),
        content_as_list: Boolean(tab?.contentAsList || tab?.content_as_list),
        display_order: Number.isFinite(Number(tab?.display_order))
          ? Number(tab.display_order)
          : index
      }))
      .filter((tab) => tab.title && tab.content)
    : []
);

const listProductTabsByProductIds = async (db, productIds = []) => {
  await ensureProductTabsTable(db);

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return new Map();
  }

  const [rows] = await db.query(
    `
      SELECT id, product_id, title, content, content_as_list, display_order, is_active
      FROM product_tabs
      WHERE product_id IN (?) AND is_active = 1
      ORDER BY product_id ASC, display_order ASC, id ASC
    `,
    [productIds]
  );

  return rows.reduce((map, row) => {
    const normalizedTab = normalizeProductTabRow(row);
    const currentTabs = map.get(normalizedTab.product_id) || [];
    currentTabs.push(normalizedTab);
    map.set(normalizedTab.product_id, currentTabs);
    return map;
  }, new Map());
};

const attachTabsToProducts = async (db, products = []) => {
  await ensureProductTabsTable(db);

  const productIds = products.map((product) => Number(product.id)).filter(Boolean);
  const tabsByProductId = await listProductTabsByProductIds(db, productIds);

  return products.map((product) => ({
    ...product,
    product_tabs: tabsByProductId.get(Number(product.id)) || []
  }));
};

const formatProductRow = (row) => ({
  ...row,
  category_ids: row.main_category_ids
    ? String(row.main_category_ids).split(',').filter(Boolean).map(Number)
    : [],
  sub_category_ids: row.sub_category_ids
    ? String(row.sub_category_ids).split(',').filter(Boolean).map(Number)
    : [],
  is_active: Number(row.is_active ?? 1) === 1,
  is_featured: Number(row.is_featured) === 1,
  is_upcera: Number(row.is_upcera) === 1,
  is_scanner: Number(row.is_scanner) === 1,
  is_3d_printer: Number(row.is_3d_printer) === 1
});

const listProducts = async (db, options = {}) => {
  const { includeInactive = false } = options;
  const whereClause = includeInactive ? '' : ' WHERE p.is_active = 1';
  const [rows] = await db.query(`${PRODUCT_SELECT_QUERY}${whereClause} ORDER BY p.id DESC`);
  return attachTabsToProducts(db, rows.map(formatProductRow));
};

const findProductById = async (db, productId, options = {}) => {
  const { includeInactive = false } = options;
  const [rows] = await db.query(
    `${PRODUCT_SELECT_QUERY} WHERE p.id = ?${includeInactive ? '' : ' AND p.is_active = 1'}`,
    [productId]
  );
  if (!rows[0]) {
    return null;
  }

  const [product] = await attachTabsToProducts(db, [formatProductRow(rows[0])]);
  return product || null;
};

const attachProductCategories = async (connection, productId, mainCategoryIds, subCategoryIds) => {
  const validMainIds = Array.isArray(mainCategoryIds) ? mainCategoryIds : [];
  const validSubIds = Array.isArray(subCategoryIds) ? subCategoryIds : [];

  await connection.query('DELETE FROM product_categorias WHERE product_id = ?', [productId]);
  await connection.query('DELETE FROM product_sub_categorias WHERE product_id = ?', [productId]);

  if (validMainIds.length > 0) {
    const [categories] = await connection.query('SELECT id FROM categorias WHERE id IN (?)', [validMainIds]);
    const categoryValues = categories.map((category) => [productId, category.id]);
    if (categoryValues.length > 0) {
      await connection.query('INSERT INTO product_categorias (product_id, category_id) VALUES ?', [categoryValues]);
    }
  }

  if (validSubIds.length > 0) {
    const [subCategories] = await connection.query('SELECT id FROM sub_categorias WHERE id IN (?)', [validSubIds]);
    const subCategoryValues = subCategories.map((subCategory) => [productId, subCategory.id]);
    if (subCategoryValues.length > 0) {
      await connection.query('INSERT INTO product_sub_categorias (product_id, sub_category_id) VALUES ?', [subCategoryValues]);
    }
  }
};

const replaceProductTabs = async (connection, productId, tabs = []) => {
  await ensureProductTabsTable(connection);
  await connection.query('DELETE FROM product_tabs WHERE product_id = ?', [productId]);

  const normalizedTabs = normalizeIncomingTabs(tabs);

  if (normalizedTabs.length === 0) {
    return;
  }

  const values = normalizedTabs.map((tab, index) => [
    productId,
    tab.title,
    tab.content,
    tab.content_as_list ? 1 : 0,
    Number.isFinite(Number(tab.display_order)) ? Number(tab.display_order) : index,
    1
  ]);

  await connection.query(
    `
      INSERT INTO product_tabs (product_id, title, content, content_as_list, display_order, is_active)
      VALUES ?
    `,
    [values]
  );
};

module.exports = {
  formatProductRow,
  listProducts,
  findProductById,
  attachProductCategories,
  replaceProductTabs,
  ensureProductTabsTable
};
