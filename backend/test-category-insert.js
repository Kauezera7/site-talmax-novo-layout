const db = require('./db');

async function testInsert() {
    try {
        const name = "Categoria Teste " + Date.now();
        const slug = "categoria-teste-" + Date.now();
        const icon_url = null;
        const display_order = 0;

        console.log(`Tentando inserir: ${name}`);
        const [result] = await db.execute(
            'INSERT INTO categories (name, slug, icon_url, display_order) VALUES (?, ?, ?, ?)',
            [name, slug, icon_url, display_order]
        );
        
        console.log("✅ Sucesso! ID:", result.insertId);
        
        // Limpar o teste
        await db.execute('DELETE FROM categories WHERE id = ?', [result.insertId]);
        console.log("✅ Teste removido.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Erro:", err.message);
        process.exit(1);
    }
}

testInsert();
