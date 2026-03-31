/**
 * Gerencia textos e logos das paginas especiais do site.
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('../../config/database');
const upload = require('../config/upload');
const { requireAdminSession } = require('../auth/adminSession');
const { persistUploadedFile, persistExistingLocalFile, hasCloudinaryConfig } = require('../services/fileStorageService');
const { getServedImageDirs } = require('../config/imageStorage');
const { safe } = require('../utils/common');

const router = express.Router();

const PAGE_SETTINGS_TABLE_QUERY = `
  CREATE TABLE IF NOT EXISTS page_settings (
    id INT NOT NULL AUTO_INCREMENT,
    page_name VARCHAR(50) NOT NULL,
    logo_url VARCHAR(500) DEFAULT NULL,
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
  await db.query('ALTER TABLE page_settings ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500) DEFAULT NULL AFTER page_name');
  await db.query(`
    UPDATE page_settings
    SET logo_url = JSON_UNQUOTE(JSON_EXTRACT(content, '$.logo_url'))
    WHERE (logo_url IS NULL OR logo_url = '')
      AND JSON_EXTRACT(content, '$.logo_url') IS NOT NULL
  `);
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

const resolveLegacyImagePath = (assetUrl) => {
  if (!assetUrl || typeof assetUrl !== 'string' || !assetUrl.startsWith('/img/')) {
    return null;
  }

  const fileName = assetUrl.replace(/^\/img\//, '');
  const candidatePath = getServedImageDirs()
    .map((directoryPath) => path.join(directoryPath, fileName))
    .find((currentPath) => fs.existsSync(currentPath));

  return candidatePath || null;
};

const normalizePageSetting = (pageName, content = {}, explicitLogoUrl = null) => {
  const defaults = DEFAULT_PAGE_SETTINGS[pageName];

  if (!defaults) {
    return null;
  }

  return {
    ...defaults,
    overline: safe(content.overline ?? defaults.overline),
    title: safe(content.title ?? defaults.title),
    description: safe(content.description ?? defaults.description),
    logo_url: safe(explicitLogoUrl ?? content.logo_url ?? defaults.logo_url)
  };
};

const ensureDefaultRows = async () => {
  await ensurePageSettingsTable();

  for (const [pageName, defaults] of Object.entries(DEFAULT_PAGE_SETTINGS)) {
    await db.query(
      `
        INSERT INTO page_settings (page_name, logo_url, content)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE page_name = VALUES(page_name)
      `,
      [pageName, defaults.logo_url, JSON.stringify({
        page_name: defaults.page_name,
        label: defaults.label,
        overline: defaults.overline,
        title: defaults.title,
        description: defaults.description
      })]
    );
  }
};

router.get('/', async (req, res) => {
  try {
    await ensureDefaultRows();

    const [rows] = await db.query(
      'SELECT page_name, logo_url, content, updated_at FROM page_settings WHERE page_name IN (?) ORDER BY page_name ASC',
      [Object.keys(DEFAULT_PAGE_SETTINGS)]
    );

    const items = rows
      .map((row) => {
        const normalized = normalizePageSetting(row.page_name, parseContent(row.content), row.logo_url);

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
      'SELECT logo_url, content FROM page_settings WHERE page_name = ? LIMIT 1',
      [pageName]
    );

    const currentContent = normalizePageSetting(pageName, parseContent(rows[0]?.content), rows[0]?.logo_url);
    const logoFile = Array.isArray(req.files) ? req.files.find((file) => file.fieldname === 'logo') : null;
    let nextLogoUrl = logoFile
      ? await persistUploadedFile(logoFile, { resourceType: 'page-settings' })
      : safe(req.body.logo_url ?? currentContent.logo_url);

    if (!logoFile && hasCloudinaryConfig() && typeof nextLogoUrl === 'string' && nextLogoUrl.startsWith('/img/')) {
      const existingAssetPath = resolveLegacyImagePath(nextLogoUrl);

      if (existingAssetPath) {
        nextLogoUrl = await persistExistingLocalFile(existingAssetPath, { resourceType: 'page-settings' });
      }
    }

    const updatedContent = normalizePageSetting(pageName, {
      ...currentContent,
      overline: req.body.overline,
      title: req.body.title,
      description: req.body.description
    });

    await db.query(
      'UPDATE page_settings SET logo_url = ?, content = ? WHERE page_name = ?',
      [
        nextLogoUrl,
        JSON.stringify({
          page_name: updatedContent.page_name,
          label: updatedContent.label,
          overline: updatedContent.overline,
          title: updatedContent.title,
          description: updatedContent.description
        }),
        pageName
      ]
    );

    res.json({
      message: 'Configuracao atualizada com sucesso.',
      item: {
        ...updatedContent,
        logo_url: nextLogoUrl
      }
    });
  } catch (error) {
    console.error('Erro ao salvar configuracao da pagina especial:', error);
    res.status(500).json({ error: error.message || 'Erro ao salvar configuracao da pagina especial.' });
  }
});

module.exports = router;
