/**
 * Ponto de entrada do backend.
 * Carrega variaveis de ambiente, cria a app e inicia o servidor HTTP.
 */
require('dotenv').config();

const createApp = require('./src/server/app');

const app = createApp();
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
