/**
 * Adiciona a coluna logo_url aos cards/segmentos da home.
 * Permite cadastrar uma logo separada da imagem de fundo.
 */
const db = require('../../config/database');

async function addHomeServiceLogoUrlColumn() {
    try {
        console.log("Adicionando coluna logo_url na tabela home_services...");
        await db.query('ALTER TABLE home_services ADD COLUMN logo_url VARCHAR(500) DEFAULT NULL AFTER image_url');
        console.log("Coluna logo_url adicionada com sucesso!");
        process.exit(0);
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log("A coluna logo_url ja existe.");
            process.exit(0);
            return;
        }

        console.error("Erro ao atualizar tabela home_services:", err);
        process.exit(1);
    }
}

addHomeServiceLogoUrlColumn();
