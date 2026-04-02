const express = require('express');
const db = require('../../config/database');
const upload = require('../config/upload');
const { requireAdminSession } = require('../auth/adminSession');
const { parseBooleanFlag, parseInteger } = require('../utils/requestParsers');
const { persistUploadedFile } = require('../services/fileStorageService');
const { safe } = require('../utils/common');

const router = express.Router();

const DIGITAL_GROUPS_TABLE_QUERY = `
  CREATE TABLE IF NOT EXISTS digital_groups (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  )
`;

const DIGITAL_GROUP_CARDS_TABLE_QUERY = `
  CREATE TABLE IF NOT EXISTS digital_group_cards (
    id INT NOT NULL AUTO_INCREMENT,
    group_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    link_url VARCHAR(500) DEFAULT NULL,
    is_external BOOLEAN DEFAULT FALSE,
    front_image_url VARCHAR(500) DEFAULT NULL,
    back_image_url VARCHAR(500) DEFAULT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_digital_group_cards_group_id (group_id),
    CONSTRAINT fk_digital_group_cards_group
      FOREIGN KEY (group_id) REFERENCES digital_groups(id) ON DELETE CASCADE
  )
`;

let tablesReady = false;

const ensureColumn = async (tableName, columnName, definition) => {
  const [rows] = await db.query(
    `
      SELECT COUNT(*) AS total
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
    `,
    [tableName, columnName]
  );

  if (Number(rows?.[0]?.total || 0) === 0) {
    await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
};

const ensureTables = async () => {
  if (tablesReady) return;
  await db.query(DIGITAL_GROUPS_TABLE_QUERY);
  await db.query(DIGITAL_GROUP_CARDS_TABLE_QUERY);
  await ensureColumn('digital_groups', 'overline', 'VARCHAR(255) DEFAULT NULL AFTER description');
  await ensureColumn('digital_groups', 'hero_title', 'VARCHAR(255) DEFAULT NULL AFTER overline');
  await ensureColumn('digital_groups', 'hero_description', 'TEXT DEFAULT NULL AFTER hero_title');
  await ensureColumn('digital_groups', 'logo_url', 'VARCHAR(500) DEFAULT NULL AFTER hero_description');
  tablesReady = true;
};

const parseCards = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }
  return [];
};

const getUploadedFileByField = (files = [], fieldName) => (
  Array.isArray(files) ? files.find((file) => file.fieldname === fieldName) || null : null
);

const listGroups = async ({ onlyActive = false } = {}) => {
  await ensureTables();

  const [groups] = await db.query(
    `
      SELECT *
      FROM digital_groups
      ${onlyActive ? 'WHERE is_active = 1' : ''}
      ORDER BY display_order ASC, id ASC
    `
  );

  const [cards] = await db.query(
    `
      SELECT *
      FROM digital_group_cards
      ${onlyActive ? 'WHERE is_active = 1' : ''}
      ORDER BY display_order ASC, id ASC
    `
  );

  const cardsByGroupId = cards.reduce((map, card) => {
    const key = Number(card.group_id);
    const current = map.get(key) || [];
    current.push({
      id: Number(card.id),
      title: card.title || '',
      description: card.description || '',
      link_url: card.link_url || '',
      is_external: Number(card.is_external) === 1,
      front_image_url: card.front_image_url || '',
      back_image_url: card.back_image_url || '',
      display_order: Number(card.display_order || 0),
      is_active: Number(card.is_active ?? 1) === 1
    });
    map.set(key, current);
    return map;
  }, new Map());

  return groups.map((group) => ({
    id: Number(group.id),
    title: group.title || '',
    description: group.description || '',
    overline: group.overline || '',
    hero_title: group.hero_title || '',
    hero_description: group.hero_description || '',
    logo_url: group.logo_url || '',
    display_order: Number(group.display_order || 0),
    is_active: Number(group.is_active ?? 1) === 1,
    cards: cardsByGroupId.get(Number(group.id)) || []
  }));
};

const replaceGroupCards = async (connection, groupId, files, cards = []) => {
  await connection.query('DELETE FROM digital_group_cards WHERE group_id = ?', [groupId]);

  for (let index = 0; index < cards.length; index += 1) {
    const card = cards[index];
    const tempId = String(card?.temp_id || card?.id || `card-${index}`).trim();
    const frontImageFile = getUploadedFileByField(files, `card_front_${tempId}`);
    const backImageFile = getUploadedFileByField(files, `card_back_${tempId}`);

    const frontImageUrl = frontImageFile
      ? await persistUploadedFile(frontImageFile, { resourceType: 'digital-groups' })
      : safe(card.front_image_url || '');
    const backImageUrl = backImageFile
      ? await persistUploadedFile(backImageFile, { resourceType: 'digital-groups' })
      : safe(card.back_image_url || '');

    await connection.query(
      `
        INSERT INTO digital_group_cards (
          group_id, title, description, link_url, is_external, front_image_url, back_image_url, display_order, is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        groupId,
        safe(card.title || ''),
        safe(card.description || ''),
        safe(card.link_url || ''),
        parseBooleanFlag(card.is_external) ? 1 : 0,
        frontImageUrl,
        backImageUrl,
        index,
        card.is_active === false ? 0 : 1
      ]
    );
  }
};

router.get('/', async (req, res) => {
  try {
    const onlyActive = req.query.admin !== '1';
    const items = await listGroups({ onlyActive });
    res.json(items);
  } catch (error) {
    console.error('Erro ao listar grupos digitais:', error);
    res.status(500).json({ error: 'Erro ao listar grupos digitais.' });
  }
});

router.get('/public/:id', async (req, res) => {
  try {
    const items = await listGroups({ onlyActive: true });
    const item = items.find((group) => Number(group.id) === Number(req.params.id));

    if (!item) {
      return res.status(404).json({ error: 'Grupo digital nao encontrado.' });
    }

    res.json(item);
  } catch (error) {
    console.error('Erro ao buscar grupo digital publico:', error);
    res.status(500).json({ error: 'Erro ao buscar grupo digital publico.' });
  }
});

router.post('/', requireAdminSession, upload.any(), async (req, res) => {
  const connection = await db.getConnection();

  try {
    await ensureTables();
    const cards = parseCards(req.body.cards);
    const logoFile = getUploadedFileByField(req.files, 'logo');
    const logoUrl = logoFile
      ? await persistUploadedFile(logoFile, { resourceType: 'digital-groups' })
      : safe(req.body.logo_url || '');

    await connection.beginTransaction();
    const [result] = await connection.query(
      `
        INSERT INTO digital_groups (title, description, overline, hero_title, hero_description, logo_url, display_order, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        safe(req.body.title || ''),
        safe(req.body.description || ''),
        safe(req.body.overline || ''),
        safe(req.body.hero_title || ''),
        safe(req.body.hero_description || ''),
        logoUrl,
        parseInteger(req.body.display_order, 0),
        req.body.is_active === 'false' ? 0 : 1
      ]
    );

    await replaceGroupCards(connection, result.insertId, req.files, cards);
    await connection.commit();

    res.status(201).json({ message: 'Grupo digital criado com sucesso.' });
  } catch (error) {
    await connection.rollback().catch(() => {});
    console.error('Erro ao criar grupo digital:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar grupo digital.' });
  } finally {
    connection.release();
  }
});

router.put('/:id', requireAdminSession, upload.any(), async (req, res) => {
  const connection = await db.getConnection();

  try {
    await ensureTables();
    const groupId = Number(req.params.id);
    const cards = parseCards(req.body.cards);
    const logoFile = getUploadedFileByField(req.files, 'logo');
    const logoUrl = logoFile
      ? await persistUploadedFile(logoFile, { resourceType: 'digital-groups' })
      : safe(req.body.logo_url || '');

    await connection.beginTransaction();
    await connection.query(
      `
        UPDATE digital_groups
        SET title = ?, description = ?, overline = ?, hero_title = ?, hero_description = ?, logo_url = ?, display_order = ?, is_active = ?
        WHERE id = ?
      `,
      [
        safe(req.body.title || ''),
        safe(req.body.description || ''),
        safe(req.body.overline || ''),
        safe(req.body.hero_title || ''),
        safe(req.body.hero_description || ''),
        logoUrl,
        parseInteger(req.body.display_order, 0),
        req.body.is_active === 'false' ? 0 : 1,
        groupId
      ]
    );

    await replaceGroupCards(connection, groupId, req.files, cards);
    await connection.commit();

    res.json({ message: 'Grupo digital atualizado com sucesso.' });
  } catch (error) {
    await connection.rollback().catch(() => {});
    console.error('Erro ao atualizar grupo digital:', error);
    res.status(500).json({ error: error.message || 'Erro ao atualizar grupo digital.' });
  } finally {
    connection.release();
  }
});

router.delete('/:id', requireAdminSession, async (req, res) => {
  try {
    await ensureTables();
    await db.query('DELETE FROM digital_groups WHERE id = ?', [req.params.id]);
    res.json({ message: 'Grupo digital removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao remover grupo digital:', error);
    res.status(500).json({ error: 'Erro ao remover grupo digital.' });
  }
});

module.exports = router;
