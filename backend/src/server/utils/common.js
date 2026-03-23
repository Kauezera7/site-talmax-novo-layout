/**
 * Reune helpers simples compartilhados entre as rotas.
 * Hoje normaliza valores undefined para null antes de enviar ao banco.
 */
const safe = (value) => (value === undefined ? null : value);

module.exports = {
  safe
};
