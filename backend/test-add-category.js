const db = require('./db');

async function testAdd() {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const productId = 12;
        const catId = 116;
        
        console.log(`Associating product ${productId} with category ${catId}`);
        await connection.query('INSERT INTO product_categorias (product_id, category_id) VALUES (?, ?)', [productId, catId]);
        
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
testAdd();
