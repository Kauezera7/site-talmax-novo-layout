const db = require('./db');

async function update() {
    try {
        // Ativar os segmentos e garantir nomes corretos
        await db.query("UPDATE categorias SET is_visible = 1 WHERE slug IN ('talmax-digital', 'protese-dentaria', 'nail-e-podologia')");
        
        // Se 'Nail' e 'Podologia' devem ser separados, eu deveria ver se existem. 
        // O usuário disse "nail e podologia" no final, vou manter juntos por enquanto conforme o slug existente, 
        // mas vou renomear para ficar bonito se necessário.
        
        console.log('Segmentos atualizados para visível.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

update();
