const db = require('./db');

async function testBulk() {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const productId = 13;
        const catId = 116;
        
        const values = [[productId, catId]];
        console.log(`Bulk associating product ${productId} with category ${catId}`, values);
        await connection.query('INSERT INTO product_categorias (product_id, category_id) VALUES ?', [values]);
        
        await connection.commit();
        console.log("Success!");
    } catch (err) {
        await connection.rollback();
        console.error("FAILED:", err);
    } finally {
        connection.release();
        process.exit(0);
    }
}
testBulk();
