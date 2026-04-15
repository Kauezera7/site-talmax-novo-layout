const crypto = require('crypto');

const SCRYPT_PASSWORD_PREFIX = 'scrypt$';

const safeEqual = (valueA, valueB) => {
  const bufferA = Buffer.from(String(valueA));
  const bufferB = Buffer.from(String(valueB));

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferA, bufferB);
};

const isScryptPasswordHash = (value) => (
  typeof value === 'string' && value.startsWith(SCRYPT_PASSWORD_PREFIX)
);

const hashAdminPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `${SCRYPT_PASSWORD_PREFIX}${salt}$${hash}`;
};

const verifyAdminPassword = (password, storedPassword) => {
  if (!isScryptPasswordHash(storedPassword)) {
    return false;
  }

  const [, salt, hash] = storedPassword.split('$');

  if (!salt || !hash) {
    return false;
  }

  const candidateHash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return safeEqual(candidateHash, hash);
};

module.exports = {
  hashAdminPassword,
  isScryptPasswordHash,
  safeEqual,
  verifyAdminPassword
};
