/**
 * Ajusta o nome exibido dos segmentos principais.
 * Mantem os slugs como estao e apenas corrige a capitalizacao dos titulos.
 */
const db = require('./db');

async function update() {
    try {
        await db.query("UPDATE categorias SET name = 'Talmax Digital' WHERE slug = 'talmax-digital'");
        await db.query("UPDATE categorias SET name = 'Prótese Dentária' WHERE slug = 'protese-dentaria'");
        await db.query("UPDATE categorias SET name = 'Nail e Podologia' WHERE slug = 'nail-e-podologia'");
        
        console.log('Nomes dos segmentos capitalizados.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

update();
