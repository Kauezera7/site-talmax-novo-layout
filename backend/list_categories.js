const db = require('./db');

async function list() {
    try {
        const [cats] = await db.query('SELECT * FROM categorias');
        console.log('--- CATEGORIAS ---');
        console.table(cats);

        const [subs] = await db.query('SELECT * FROM sub_categorias');
        console.log('--- SUB_CATEGORIAS ---');
        console.table(subs);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

list();
