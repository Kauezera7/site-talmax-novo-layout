// Utility functions for querying products based on categories

/**
 * Get products by category
 * @param {Array} products - The array of products to filter
 * @param {String} category - The category to filter by
 * @returns {Array} - Filtered products
 */
function getProductsByCategory(products, category) {
    return products.filter(product => product.category === category);
}

/**
 * Get all unique categories from products
 * @param {Array} products - The array of products
 * @returns {Array} - Unique categories
 */
function getUniqueCategories(products) {
    const categories = products.map(product => product.category);
    return [...new Set(categories)];
}

module.exports = {
    getProductsByCategory,
    getUniqueCategories
};