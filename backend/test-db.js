const db = require('./db');

async function testConnection() {
    try {
        console.log('--- TESTE DE CONEXÃO COM O BANCO ---');
        console.log('Tentando conectar ao banco de dados: ' + (process.env.DB_NAME || 'site-talmax'));

        // Tenta fazer uma consulta simples (Apenas perguntar pro banco: "1 + 1 é quanto?")
        const [rows] = await db.query('SELECT 1 + 1 AS result');
        
        if (rows[0].result === 2) {
            console.log('✅ SUCESSO! O Backend conseguiu falar com o MySQL.');
            console.log('Você já pode começar a cadastrar os produtos.');
        }

    } catch (err) {
        console.log('❌ ERRO AO CONECTAR!');
        console.log('Mensagem do erro:', err.message);
        
        if (err.code === 'ER_BAD_DB_ERROR') {
            console.log('DICA: O Banco de dados "site-talmax" não foi encontrado. Verifique o nome no MySQL.');
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('DICA: Usuário ou Senha do MySQL estão incorretos no seu db.js ou .env.');
        } else if (err.code === 'ECONNREFUSED') {
            console.log('DICA: O MySQL não está ligado! Ligue o XAMPP ou MySQL Service.');
        }
    } finally {
        // Encerra o teste
        process.exit();
    }
}

testConnection();
