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

const formatProductRow = (row) => ({
  ...row,
  category_ids: row.main_category_ids ? row.main_category_ids.split(',').map(Number) : [],
  sub_category_ids: row.sub_category_ids ? row.sub_category_ids.split(',').map(Number) : [],
  is_upcera: row.is_upcera === 1,
  is_scanner: row.is_scanner === 1,
  is_3d_printer: row.is_3d_printer === 1
});

const listProducts = async (db) => {
  const [rows] = await db.query(`${PRODUCT_SELECT_QUERY} ORDER BY p.id DESC`);
  return rows.map(formatProductRow);
};

const findProductById = async (db, productId) => {
  const [rows] = await db.query(`${PRODUCT_SELECT_QUERY} WHERE p.id = ?`, [productId]);
  return rows[0] ? formatProductRow(rows[0]) : null;
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

module.exports = {
  listProducts,
  findProductById,
  attachProductCategories
};
