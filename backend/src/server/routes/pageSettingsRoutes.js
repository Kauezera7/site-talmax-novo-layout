/**
 * Gerencia textos e logos das paginas especiais do site.
 */
const express = require('express');
const db = require('../../config/database');
const upload = require('../config/upload');
const { requireAdminSession } = require('../auth/adminSession');
const { persistUploadedFile } = require('../services/fileStorageService');
const { safe } = require('../utils/common');

const router = express.Router();

const PAGE_SETTINGS_TABLE_QUERY = `
  CREATE TABLE IF NOT EXISTS page_settings (
    id INT NOT NULL AUTO_INCREMENT,
    page_name VARCHAR(50) NOT NULL,
    content JSON DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_page_settings_page_name (page_name)
  )
`;

const DEFAULT_PAGE_SETTINGS = {
  'talmax-digital': {
    page_name: 'talmax-digital',
    label: 'Talmax Digital',
    overline: 'TECNOLOGIA ODONTOLOGICA',
    title: 'Talmax Digital',
    description: 'O futuro da protese dentaria com tecnologia de ponta e precisao absoluta.',
    logo_url: '/img/logo-talmax-digital-pos.png'
  },
  upcera: {
    page_name: 'upcera',
    label: 'Upcera',
    overline: '',
    title: 'Innovation in Restorative Dentistry',
    description: 'Lider mundial em ceramicas odontologicas de alta performance, unindo estetica natural e resistencia extrema.',
    logo_url: '/img/logo-upcera-.webp'
  },
  scanners: {
    page_name: 'scanners',
    label: 'Scanners',
    overline: '',
    title: 'Digital Reality Capture',
    description: 'A mais alta tecnologia em digitalizacao 3D, transformando o fluxo fisico em digital com precisao absoluta.',
    logo_url: '/img/titulo-pag-scanners.png'
  },
  printers: {
    page_name: 'printers',
    label: 'Impressoras 3D',
    overline: '',
    title: 'High Precision Printing',
    description: 'A revolucao da manufatura aditiva com precisao industrial para o fluxo digital odontologico.',
    logo_url: '/img/impressoras3d.png'
  }
};

let pageSettingsTableReady = false;

const ensurePageSettingsTable = async () => {
  if (pageSettingsTableReady) {
    return;
  }

  await db.query(PAGE_SETTINGS_TABLE_QUERY);
  pageSettingsTableReady = true;
};

const parseContent = (value) => {
  if (!value) return {};

  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      return {};
    }
  }

  return value && typeof value === 'object' ? value : {};
};

const normalizePageSetting = (pageName, content = {}) => {
  const defaults = DEFAULT_PAGE_SETTINGS[pageName];

  if (!defaults) {
    return null;
  }

  return {
    ...defaults,
    overline: safe(content.overline ?? defaults.overline),
    title: safe(content.title ?? defaults.title),
    description: safe(content.description ?? defaults.description),
    logo_url: safe(content.logo_url ?? defaults.logo_url)
  };
};

const ensureDefaultRows = async () => {
  await ensurePageSettingsTable();

  for (const [pageName, defaults] of Object.entries(DEFAULT_PAGE_SETTINGS)) {
    await db.query(
      `
        INSERT INTO page_settings (page_name, content)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE page_name = VALUES(page_name)
      `,
      [pageName, JSON.stringify(defaults)]
    );
  }
};

router.get('/', async (req, res) => {
  try {
    await ensureDefaultRows();

    const [rows] = await db.query(
      'SELECT page_name, content, updated_at FROM page_settings WHERE page_name IN (?) ORDER BY page_name ASC',
      [Object.keys(DEFAULT_PAGE_SETTINGS)]
    );

    const items = rows
      .map((row) => {
        const normalized = normalizePageSetting(row.page_name, parseContent(row.content));

        if (!normalized) {
          return null;
        }

        return {
          ...normalized,
          updated_at: row.updated_at
        };
      })
      .filter(Boolean);

    res.json(items);
  } catch (error) {
    console.error('Erro ao carregar configuracoes das paginas:', error);
    res.status(500).json({ error: 'Erro ao carregar configuracoes das paginas.' });
  }
});

router.put('/:pageName', requireAdminSession, upload.any(), async (req, res) => {
  const { pageName } = req.params;

  if (!DEFAULT_PAGE_SETTINGS[pageName]) {
    return res.status(404).json({ error: 'Pagina especial nao encontrada.' });
  }

  try {
    await ensureDefaultRows();

    const [rows] = await db.query(
      'SELECT content FROM page_settings WHERE page_name = ? LIMIT 1',
      [pageName]
    );

    const currentContent = normalizePageSetting(pageName, parseContent(rows[0]?.content));
    const logoFile = Array.isArray(req.files) ? req.files.find((file) => file.fieldname === 'logo') : null;
    const nextLogoUrl = logoFile
      ? await persistUploadedFile(logoFile, { resourceType: 'page-settings' })
      : safe(req.body.logo_url ?? currentContent.logo_url);

    const updatedContent = normalizePageSetting(pageName, {
      ...currentContent,
      overline: req.body.overline,
      title: req.body.title,
      description: req.body.description,
      logo_url: nextLogoUrl
    });

    await db.query(
      'UPDATE page_settings SET content = ? WHERE page_name = ?',
      [JSON.stringify(updatedContent), pageName]
    );

    res.json({
      message: 'Configuracao atualizada com sucesso.',
      item: updatedContent
    });
  } catch (error) {
    console.error('Erro ao salvar configuracao da pagina especial:', error);
    res.status(500).json({ error: error.message || 'Erro ao salvar configuracao da pagina especial.' });
  }
});

module.exports = router;
