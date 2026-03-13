const db = require('./db');

async function testError() {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const productId = 1; // Supondo que o produto 1 exista
        const validIds = [109, 1]; // Uma categoria e uma subcategoria
        
        console.log("Testing with IDs:", validIds);
        
        const [cats] = await connection.query('SELECT id FROM categorias WHERE id IN (?)', [validIds]);
        const [subs] = await connection.query('SELECT id FROM sub_categorias WHERE id IN (?)', [validIds]);
        
        const catIdsFound = cats.map(c => c.id);
        const subIdsFound = subs.map(s => s.id);
        
        console.log("Found categories:", catIdsFound);
        console.log("Found subcategories:", subIdsFound);
        
        if (catIdsFound.length > 0) {
            const values = catIdsFound.map(id => [productId, id]);
            console.log("Inserting into product_categorias:", values);
            await connection.query('INSERT INTO product_categorias (product_id, category_id) VALUES ?', [values]);
        }
        
        if (subIdsFound.length > 0) {
            const values = subIdsFound.map(id => [productId, id]);
            console.log("Inserting into product_sub_categorias:", values);
            await connection.query('INSERT INTO product_sub_categorias (product_id, sub_category_id) VALUES ?', [values]);
        }
        
        await connection.commit();
        console.log("Success!");
    } catch (err) {
        await connection.rollback();
        console.error("FAILED AS EXPECTED OR UNEXPECTEDLY:", err);
    } finally {
        connection.release();
        process.exit(0);
    }
}

testError();
