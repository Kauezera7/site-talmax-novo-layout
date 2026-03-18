// helpers.js

/**
 * Safe function to handle values
 * @param {any} value - value to handle
 * @returns {any} - processed value
 */
function safe(value) {
    return value !== null && value !== undefined ? value : 'default';
}

// Additional helper utilities

/**
 * Generate a random integer between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random integer
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Exporting functions
module.exports = { safe, randomInt, formatDate };