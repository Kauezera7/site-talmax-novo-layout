const { z } = require('zod');
const { sanitizeTextInput } = require('../utils/inputSanitization');

const ADMIN_ROLE_MASTER = 'master';
const ADMIN_ROLE_EDITOR = 'editor';
const ADMIN_USER_ALLOWED_ROLES = [ADMIN_ROLE_MASTER, ADMIN_ROLE_EDITOR];
const ADMIN_USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

const sanitizeSingleLineText = (value) => (
  typeof value === 'string'
    ? sanitizeTextInput(value, { preserveNewlines: false })
    : value
);

const requiredTrimmedString = (label, maxLength) => z.preprocess(
  sanitizeSingleLineText,
  z.string({
    required_error: `${label} e obrigatorio.`,
    invalid_type_error: `${label} precisa ser um texto.`
  })
    .min(1, `${label} e obrigatorio.`)
    .max(maxLength, `${label} deve ter no maximo ${maxLength} caracteres.`)
);

const optionalTrimmedString = (label, maxLength) => z.preprocess((value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return sanitizeSingleLineText(value);
}, z.string({
  invalid_type_error: `${label} precisa ser um texto.`
})
  .min(1, `${label} e obrigatorio.`)
  .max(maxLength, `${label} deve ter no maximo ${maxLength} caracteres.`)
  .optional());

const requiredEmail = z.preprocess(
  sanitizeSingleLineText,
  z.string({
    required_error: 'E-mail e obrigatorio.',
    invalid_type_error: 'E-mail precisa ser um texto.'
  })
    .min(1, 'E-mail e obrigatorio.')
    .max(160, 'E-mail deve ter no maximo 160 caracteres.')
    .email('Informe um e-mail valido.')
    .transform((value) => value.toLowerCase())
);

const optionalEmail = z.preprocess((value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return sanitizeSingleLineText(value);
}, z.string({
  invalid_type_error: 'E-mail precisa ser um texto.'
})
  .max(160, 'E-mail deve ter no maximo 160 caracteres.')
  .email('Informe um e-mail valido.')
  .transform((value) => value.toLowerCase())
  .optional());

const requiredUsername = z.preprocess(
  sanitizeSingleLineText,
  z.string({
    required_error: 'Usuario e obrigatorio.',
    invalid_type_error: 'Usuario precisa ser um texto.'
  })
    .min(3, 'Usuario deve ter pelo menos 3 caracteres.')
    .max(50, 'Usuario deve ter no maximo 50 caracteres.')
    .regex(ADMIN_USERNAME_PATTERN, 'Usuario pode ter apenas letras, numeros, ponto, traco e underscore.')
);

const optionalUsername = z.preprocess((value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return sanitizeSingleLineText(value);
}, z.string({
  invalid_type_error: 'Usuario precisa ser um texto.'
})
  .min(3, 'Usuario deve ter pelo menos 3 caracteres.')
  .max(50, 'Usuario deve ter no maximo 50 caracteres.')
  .regex(ADMIN_USERNAME_PATTERN, 'Usuario pode ter apenas letras, numeros, ponto, traco e underscore.')
  .optional());

const requiredPassword = z.preprocess(
  sanitizeSingleLineText,
  z.string({
    required_error: 'Senha e obrigatoria.',
    invalid_type_error: 'Senha precisa ser um texto.'
  })
    .min(6, 'Senha deve ter pelo menos 6 caracteres.')
    .max(100, 'Senha deve ter no maximo 100 caracteres.')
);

const optionalPassword = z.preprocess((value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return sanitizeSingleLineText(value);
}, z.string({
  invalid_type_error: 'Senha precisa ser um texto.'
})
  .min(6, 'Senha deve ter pelo menos 6 caracteres.')
  .max(100, 'Senha deve ter no maximo 100 caracteres.')
  .optional());

const requiredRole = z.preprocess((value) => {
  if (typeof value === 'string') {
    return sanitizeSingleLineText(value).toLowerCase();
  }

  return value;
}, z.string({
  required_error: 'Perfil de acesso e obrigatorio.',
  invalid_type_error: 'Perfil de acesso invalido.'
}).refine((role) => ADMIN_USER_ALLOWED_ROLES.includes(role), 'Perfil de acesso invalido.'));

const optionalRole = z.preprocess((value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'string') {
    return sanitizeSingleLineText(value).toLowerCase();
  }

  return value;
}, z.string({
  invalid_type_error: 'Perfil de acesso invalido.'
})
  .refine((role) => ADMIN_USER_ALLOWED_ROLES.includes(role), 'Perfil de acesso invalido.')
  .optional());

const createAdminUserSchema = z.object({
  full_name: requiredTrimmedString('Nome do funcionario', 100),
  email: requiredEmail,
  username: requiredUsername,
  password: requiredPassword,
  role: requiredRole.default(ADMIN_ROLE_EDITOR)
}).strict();

const updateAdminUserSchema = z.object({
  full_name: optionalTrimmedString('Nome do funcionario', 100),
  email: optionalEmail,
  username: optionalUsername,
  password: optionalPassword,
  role: optionalRole
})
  .strict()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'Informe ao menos um campo para atualizar.'
  });

module.exports = {
  ADMIN_ROLE_MASTER,
  ADMIN_ROLE_EDITOR,
  createAdminUserSchema,
  updateAdminUserSchema
};
