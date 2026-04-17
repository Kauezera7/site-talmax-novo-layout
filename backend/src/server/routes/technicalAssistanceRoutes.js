/**
 * CRUD das unidades/cards da pagina de Assistencia Tecnica.
 */
const express = require('express');
const db = require('../../config/database');
const { requireAdminSession } = require('../auth/adminSession');
const { wrapError } = require('../utils/errorHandling');
const { sanitizeTextInput } = require('../utils/inputSanitization');

const router = express.Router();

const TECHNICAL_ASSISTANCE_TABLE_QUERY = `
  CREATE TABLE IF NOT EXISTS technical_assistance_cards (
    id INT NOT NULL AUTO_INCREMENT,
    company VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(120) NOT NULL,
    state_code CHAR(2) NOT NULL,
    phone VARCHAR(40) DEFAULT NULL,
    phone_2 VARCHAR(40) DEFAULT NULL,
    phone_3 VARCHAR(40) DEFAULT NULL,
    email VARCHAR(160) DEFAULT NULL,
    map_url VARCHAR(1000) DEFAULT NULL,
    site_url VARCHAR(1000) DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  )
`;

let technicalAssistanceTableReady = false;

const ensureTechnicalAssistanceTable = async () => {
  if (technicalAssistanceTableReady) {
    return;
  }

  await db.query(TECHNICAL_ASSISTANCE_TABLE_QUERY);
  await db.query('ALTER TABLE technical_assistance_cards ADD COLUMN IF NOT EXISTS phone_3 VARCHAR(40) DEFAULT NULL AFTER phone_2');
  technicalAssistanceTableReady = true;
};

const normalizeSimpleText = (value, maxLength) => (
  sanitizeTextInput(value || '', { preserveNewlines: false, maxLength })
);

const normalizeStateCode = (value) => (
  normalizeSimpleText(value, 2)
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 2)
);

const normalizeEmailInput = (value) => (
  normalizeSimpleText(value, 160)
    .toLowerCase()
    .replace(/\s+/g, '')
);

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const normalizeHttpUrl = (value) => {
  const sanitized = normalizeSimpleText(value, 1000);

  if (!sanitized) {
    return '';
  }

  try {
    const parsedUrl = new URL(sanitized);
    return ['http:', 'https:'].includes(parsedUrl.protocol) ? parsedUrl.toString() : '';
  } catch (error) {
    return '';
  }
};

const normalizeTechnicalAssistancePayload = (input = {}) => ({
  company: normalizeSimpleText(input.company, 255),
  address: normalizeSimpleText(input.address, 255),
  city: normalizeSimpleText(input.city, 120),
  state_code: normalizeStateCode(input.state_code || input.uf),
  phone: normalizeSimpleText(input.phone, 40),
  phone_2: normalizeSimpleText(input.phone_2, 40),
  phone_3: normalizeSimpleText(input.phone_3, 40),
  email: normalizeEmailInput(input.email),
  map_url: normalizeHttpUrl(input.map_url),
  site_url: normalizeHttpUrl(input.site_url)
});

const buildValidationErrors = (payload, rawInput = {}) => {
  const details = [];

  if (!payload.company) {
    details.push({ field: 'company', message: 'Informe a empresa.' });
  }

  if (!payload.address) {
    details.push({ field: 'address', message: 'Informe o endereco.' });
  }

  if (!payload.city) {
    details.push({ field: 'city', message: 'Informe a cidade.' });
  }

  if (!payload.state_code || payload.state_code.length !== 2) {
    details.push({ field: 'state_code', message: 'Informe a UF com 2 letras.' });
  }

  if (payload.email && !isValidEmail(payload.email)) {
    details.push({ field: 'email', message: 'Informe um e-mail valido.' });
  }

  if (rawInput.map_url && !payload.map_url) {
    details.push({ field: 'map_url', message: 'Informe uma URL valida para o mapa.' });
  }

  if (rawInput.site_url && !payload.site_url) {
    details.push({ field: 'site_url', message: 'Informe uma URL valida para o site.' });
  }

  return details;
};

const normalizeTechnicalAssistanceRow = (row) => ({
  id: Number(row.id),
  company: normalizeSimpleText(row.company, 255),
  address: normalizeSimpleText(row.address, 255),
  city: normalizeSimpleText(row.city, 120),
  state_code: normalizeStateCode(row.state_code),
  phone: normalizeSimpleText(row.phone, 40),
  phone_2: normalizeSimpleText(row.phone_2, 40),
  phone_3: normalizeSimpleText(row.phone_3, 40),
  email: normalizeEmailInput(row.email),
  map_url: normalizeHttpUrl(row.map_url),
  site_url: normalizeHttpUrl(row.site_url),
  created_at: row.created_at,
  updated_at: row.updated_at
});

router.get('/', async (req, res, next) => {
  try {
    await ensureTechnicalAssistanceTable();

    const [rows] = await db.query(`
      SELECT
        id,
        company,
        address,
        city,
        state_code,
        phone,
        phone_2,
        phone_3,
        email,
        map_url,
        site_url,
        created_at,
        updated_at
      FROM technical_assistance_cards
      ORDER BY created_at ASC, id ASC
    `);

    res.json(rows.map(normalizeTechnicalAssistanceRow));
  } catch (error) {
    return next(wrapError(error, { publicMessage: 'Erro ao carregar os cards da assistencia tecnica.' }));
  }
});

router.post('/', requireAdminSession, async (req, res, next) => {
  try {
    await ensureTechnicalAssistanceTable();

    const payload = normalizeTechnicalAssistancePayload(req.body);
    const details = buildValidationErrors(payload, req.body);

    if (details.length > 0) {
      return res.status(400).json({
        error: 'Dados invalidos para o card de assistencia tecnica.',
        details
      });
    }

    const [result] = await db.query(
      `
        INSERT INTO technical_assistance_cards (
          company,
          address,
          city,
          state_code,
          phone,
          phone_2,
          phone_3,
          email,
          map_url,
          site_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        payload.company,
        payload.address,
        payload.city,
        payload.state_code,
        payload.phone || null,
        payload.phone_2 || null,
        payload.phone_3 || null,
        payload.email || null,
        payload.map_url || null,
        payload.site_url || null
      ]
    );

    const [rows] = await db.query('SELECT * FROM technical_assistance_cards WHERE id = ? LIMIT 1', [result.insertId]);

    res.status(201).json({
      message: 'Card de assistencia tecnica criado com sucesso.',
      item: normalizeTechnicalAssistanceRow(rows[0])
    });
  } catch (error) {
    return next(wrapError(error, { publicMessage: 'Erro ao criar o card de assistencia tecnica.' }));
  }
});

router.put('/:id', requireAdminSession, async (req, res, next) => {
  const { id } = req.params;

  try {
    await ensureTechnicalAssistanceTable();

    const [existingRows] = await db.query('SELECT id FROM technical_assistance_cards WHERE id = ? LIMIT 1', [id]);

    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Card de assistencia tecnica nao encontrado.' });
    }

    const payload = normalizeTechnicalAssistancePayload(req.body);
    const details = buildValidationErrors(payload, req.body);

    if (details.length > 0) {
      return res.status(400).json({
        error: 'Dados invalidos para o card de assistencia tecnica.',
        details
      });
    }

    await db.query(
      `
        UPDATE technical_assistance_cards
        SET
          company = ?,
          address = ?,
          city = ?,
          state_code = ?,
          phone = ?,
          phone_2 = ?,
          phone_3 = ?,
          email = ?,
          map_url = ?,
          site_url = ?
        WHERE id = ?
      `,
      [
        payload.company,
        payload.address,
        payload.city,
        payload.state_code,
        payload.phone || null,
        payload.phone_2 || null,
        payload.phone_3 || null,
        payload.email || null,
        payload.map_url || null,
        payload.site_url || null,
        id
      ]
    );

    const [rows] = await db.query('SELECT * FROM technical_assistance_cards WHERE id = ? LIMIT 1', [id]);

    res.json({
      message: 'Card de assistencia tecnica atualizado com sucesso.',
      item: normalizeTechnicalAssistanceRow(rows[0])
    });
  } catch (error) {
    return next(wrapError(error, { publicMessage: 'Erro ao atualizar o card de assistencia tecnica.' }));
  }
});

router.delete('/:id', requireAdminSession, async (req, res, next) => {
  const { id } = req.params;

  try {
    await ensureTechnicalAssistanceTable();
    await db.query('DELETE FROM technical_assistance_cards WHERE id = ?', [id]);

    res.json({ message: 'Card de assistencia tecnica removido com sucesso.' });
  } catch (error) {
    return next(wrapError(error, { publicMessage: 'Erro ao remover o card de assistencia tecnica.' }));
  }
});

module.exports = router;
