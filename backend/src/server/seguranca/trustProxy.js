/**
 * Permite configurar trust proxy por variavel de ambiente.
 * Isso ajuda leituras de IP e protocolo quando a aplicacao roda
 * atras de proxy reverso.
 */
const parseTrustProxySetting = (value) => {
  if (value == null) {
    return null;
  }

  const normalizedValue = String(value).trim();

  if (!normalizedValue) {
    return null;
  }

  const lowerCasedValue = normalizedValue.toLowerCase();

  if (lowerCasedValue === 'true') {
    return true;
  }

  if (lowerCasedValue === 'false') {
    return false;
  }

  const numericValue = Number.parseInt(normalizedValue, 10);

  if (Number.isFinite(numericValue) && String(numericValue) === normalizedValue) {
    return numericValue;
  }

  return normalizedValue;
};

const applyTrustProxy = (app) => {
  const trustProxySetting = parseTrustProxySetting(process.env.EXPRESS_TRUST_PROXY);

  if (trustProxySetting !== null) {
    app.set('trust proxy', trustProxySetting);
  }
};

module.exports = applyTrustProxy;
