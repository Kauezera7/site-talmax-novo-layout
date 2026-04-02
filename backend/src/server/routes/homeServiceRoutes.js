/**
 * Define as rotas para gerenciar os quadros (servicos/segmentos) da Home.
 */
const express = require('express');
const db = require('../../config/database');
const { requireAdminSession } = require('../auth/adminSession');
const upload = require('../config/upload');
const { safe } = require('../utils/common');
const { parseBooleanFlag, parseInteger } = require('../utils/requestParsers');
const { persistUploadedFile } = require('../services/fileStorageService');

const router = express.Router();

const parseActionsPayload = (value) => {
  if (value === undefined || value === null || value === '') {
    return [];
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      return [];
    }
  }

  return value;
};

const getUploadedFileByField = (files = [], fieldName) => (
  Array.isArray(files) ? files.find((file) => file.fieldname === fieldName) || null : null
);

const persistCardAssets = async (files, card, { frontFieldPrefix, backFieldPrefix }) => {
  const cardId = String(card?.id || '').trim();

  if (!cardId) {
    return null;
  }

  const frontImageFile = getUploadedFileByField(files, `${frontFieldPrefix}${cardId}`);
  const backImageFile = getUploadedFileByField(files, `${backFieldPrefix}${cardId}`);

  const front_image_url = frontImageFile
    ? await persistUploadedFile(frontImageFile, { resourceType: 'talmax-digital' })
    : safe(card.front_image_url || null);

  const back_image_url = backImageFile
    ? await persistUploadedFile(backImageFile, { resourceType: 'talmax-digital' })
    : safe(card.back_image_url || null);

  return {
    id: cardId,
    title: safe(card.title || ''),
    description: safe(card.description || ''),
    link_url: safe(card.link_url || ''),
    is_external: parseBooleanFlag(card.is_external) ? 1 : 0,
    front_image_url,
    back_image_url
  };
};

const persistDigitalCardsConfig = async (files, incomingActions, previousActions = {}) => {
  const currentActions = incomingActions && typeof incomingActions === 'object'
    ? incomingActions
    : {};

  const normalizedPreviousActions = previousActions && typeof previousActions === 'object'
    ? previousActions
    : {};

  const baseGroups = Array.isArray(currentActions.digital_groups)
    ? currentActions.digital_groups
    : Array.isArray(normalizedPreviousActions.digital_groups)
      ? normalizedPreviousActions.digital_groups
      : [];

  if (baseGroups.length > 0) {
    const digitalGroups = [];

    for (const group of baseGroups) {
      const groupId = String(group?.id || '').trim();

      if (!groupId) {
        continue;
      }

      const cards = [];
      const baseCards = Array.isArray(group?.cards) ? group.cards : [];

      for (const card of baseCards) {
        const normalizedCard = await persistCardAssets(files, card, {
          frontFieldPrefix: 'digital_group_card_front_',
          backFieldPrefix: 'digital_group_card_back_'
        });

        if (normalizedCard) {
          cards.push(normalizedCard);
        }
      }

      digitalGroups.push({
        id: groupId,
        title: safe(group.title || ''),
        description: safe(group.description || ''),
        cards
      });
    }

    return {
      ...currentActions,
      digital_groups: digitalGroups
    };
  }

  const baseCards = Array.isArray(currentActions.digital_cards)
    ? currentActions.digital_cards
    : Array.isArray(normalizedPreviousActions.digital_cards)
      ? normalizedPreviousActions.digital_cards
      : [];

  if (baseCards.length === 0) {
    return currentActions;
  }

  const digitalCards = [];

  for (const card of baseCards) {
    const cardId = String(card?.id || '').trim();

    if (!cardId) {
      continue;
    }

    const normalizedCard = await persistCardAssets(files, card, {
      frontFieldPrefix: 'digital_card_front_',
      backFieldPrefix: 'digital_card_back_'
    });

    if (normalizedCard) {
      digitalCards.push(normalizedCard);
    }
  }

  return {
    ...currentActions,
    digital_cards: digitalCards
  };
};

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM home_services ORDER BY display_order ASC, name ASC');

    const services = rows.map((row) => ({
      ...row,
      actions: parseActionsPayload(row.actions),
      is_external: !!row.is_external,
      active: !!row.active
    }));

    res.json(services);
  } catch (err) {
    console.error('Erro ao buscar servicos da home:', err);
    res.status(500).json({ error: 'Erro interno ao buscar servicos' });
  }
});

router.post('/', requireAdminSession, upload.any(), async (req, res) => {
  try {
    const { name, description, link_url, is_external, display_order, active, actions } = req.body;
    const incomingActions = parseActionsPayload(actions);
    const normalizedActions = await persistDigitalCardsConfig(req.files, incomingActions);
    const imageFile = getUploadedFileByField(req.files, 'image');
    const image_url = imageFile
      ? await persistUploadedFile(imageFile, { resourceType: 'segmentos' })
      : null;

    const [result] = await db.query(
      `INSERT INTO home_services
      (name, description, image_url, link_url, is_external, display_order, active, actions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        safe(name),
        safe(description),
        safe(image_url),
        safe(link_url),
        parseBooleanFlag(is_external) ? 1 : 0,
        parseInteger(display_order, 0),
        active === 'false' || active === false ? 0 : 1,
        JSON.stringify(normalizedActions)
      ]
    );

    res.status(201).json({ id: result.insertId, message: 'Servico criado com sucesso' });
  } catch (err) {
    console.error('Erro ao criar servico da home:', err);
    res.status(500).json({ error: err.message || 'Erro interno ao criar servico' });
  }
});

router.put('/:id', requireAdminSession, upload.any(), async (req, res) => {
  const { id } = req.params;

  try {
    const { name, description, link_url, is_external, display_order, active, actions } = req.body;
    const [currentRows] = await db.query('SELECT image_url, actions FROM home_services WHERE id = ? LIMIT 1', [id]);

    if (currentRows.length === 0) {
      return res.status(404).json({ error: 'Servico nao encontrado.' });
    }

    const previousActions = parseActionsPayload(currentRows[0].actions);
    const incomingActions = parseActionsPayload(actions);
    const normalizedActions = await persistDigitalCardsConfig(req.files, incomingActions, previousActions);
    let image_url = req.body.image_url;
    const imageFile = getUploadedFileByField(req.files, 'image');

    if (imageFile) {
      image_url = await persistUploadedFile(imageFile, { resourceType: 'segmentos' });
    }

    if (image_url === undefined) {
      image_url = currentRows[0].image_url || null;
    }

    await db.query(
      `UPDATE home_services SET
        name = ?,
        description = ?,
        image_url = ?,
        link_url = ?,
        is_external = ?,
        display_order = ?,
        active = ?,
        actions = ?
      WHERE id = ?`,
      [
        safe(name),
        safe(description),
        safe(image_url),
        safe(link_url),
        parseBooleanFlag(is_external) ? 1 : 0,
        parseInteger(display_order, 0),
        active === 'false' || active === false ? 0 : 1,
        JSON.stringify(normalizedActions),
        id
      ]
    );

    res.json({ message: 'Servico atualizado com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar servico da home:', err);
    res.status(500).json({ error: err.message || 'Erro interno ao atualizar servico' });
  }
});

router.delete('/:id', requireAdminSession, async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM home_services WHERE id = ?', [id]);
    res.json({ message: 'Servico removido com sucesso' });
  } catch (err) {
    console.error('Erro ao remover servico da home:', err);
    res.status(500).json({ error: err.message || 'Erro interno ao remover servico' });
  }
});

router.put('/:id/active', requireAdminSession, async (req, res) => {
  const { id } = req.params;

  try {
    const active = parseBooleanFlag(req.body?.active) ? 1 : 0;
    await db.query('UPDATE home_services SET active = ? WHERE id = ?', [active, id]);
    res.json({ message: `Servico ${active ? 'ativado' : 'ocultado'} com sucesso` });
  } catch (err) {
    console.error('Erro ao atualizar status do servico da home:', err);
    res.status(500).json({ error: err.message || 'Erro interno ao atualizar status do servico' });
  }
});

module.exports = router;
