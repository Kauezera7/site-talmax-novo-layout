const db = require('./db');

// Simulating the backend route logic
async function simulatePost(name, slug) {
    try {
        console.log(`Recebendo: name=${name}, slug=${slug}`);
        if (!name || !slug) {
            console.log("Falha: campos ausentes");
            return;
        }
        const icon_url = null;
        const [result] = await db.execute(
            'INSERT INTO categories (name, slug, icon_url, display_order) VALUES (?, ?, ?, ?)',
            [name, slug, icon_url, 0]
        );
        console.log("✅ Criado! ID:", result.insertId);
    } catch (err) {
        console.error("❌ Erro:", err.message);
    }
}

async function runTest() {
    const testName = "Teste via Script " + Date.now();
    const testSlug = "teste-via-script-" + Date.now();
    await simulatePost(testName, testSlug);
    process.exit(0);
}

runTest();
