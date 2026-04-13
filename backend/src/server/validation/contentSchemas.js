const { z } = require('zod');
const {
  booleanLike,
  integerLike,
  navigationField,
  stringField,
  validateWithSchema
} = require('./requestValidation');

const categoryWritePayloadSchema = {
  name: stringField('O nome da categoria', { minLength: 1, maxLength: 160 }),
  slug: stringField('O slug da categoria', { minLength: 1, maxLength: 180 }),
  is_visible: booleanLike('is_visible', { optional: true }).optional(),
  parent_id: integerLike('parent_id', { min: 1, optional: true }).optional()
};

const bannerWritePayloadSchema = {
  title: stringField('O titulo do banner', { maxLength: 255, optional: true }),
  link_url: navigationField('O link do banner', { maxLength: 1000, optional: true }),
  display_order: integerLike('display_order', { min: 0, optional: true }).optional(),
  active: booleanLike('active', { optional: true }).optional()
};

const validateCategoryWritePayload = (payload) => validateWithSchema(
  z.object(categoryWritePayloadSchema).strict(),
  payload
);

const validateBannerWritePayload = (payload) => validateWithSchema(
  z.object(bannerWritePayloadSchema).strict(),
  payload
);

module.exports = {
  validateBannerWritePayload,
  validateCategoryWritePayload
};
