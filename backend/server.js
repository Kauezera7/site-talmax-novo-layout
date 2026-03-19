const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const db = require('./src/config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/*
  ============================================================
  CONFIGURACAO DE UPLOAD
  ============================================================

  O Multer salva imagens em:
  ../frontend/public/img

  Isso hoje atende:
  - icones de categorias
  - imagens de banners
  - imagens de produtos
*/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../frontend/public/img'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

/*
  ============================================================
  ARQUIVOS ESTATICOS
  ============================================================

  Serve o build do frontend gerado em:
  ../frontend/dist
*/
app.use(express.static(path.join(__dirname, '../frontend/dist')));

/*
  ============================================================
  FUNCAO AUXILIAR
  ============================================================

  Transforma undefined em null antes de enviar dados ao banco.
  Isso evita problemas em inserts e updates.
*/
const safe = (val) => (val === undefined ? null : val);

/*
  ============================================================
  RESUMO DAS APIS
  ============================================================

  Categorias:
  - GET    /api/categories
  - POST   /api/categories
  - PUT    /api/categories/:id
  - DELETE /api/categories/:id

  Banners:
  - GET    /api/banners
  - POST   /api/banners
  - PUT    /api/banners/:id
  - DELETE /api/banners/:id

  Produtos:
  - GET    /api/products
  - GET    /api/products/:id
  - POST   /api/products
  - PUT    /api/products/:id
  - DELETE /api/products/:id

  Secoes especiais:
  - PUT    /api/upcera/products
  - PUT    /api/scanners/products
  - PUT    /api/3d-printers/products
*/

/*
  ============================================================
  CATEGORIAS
  ============================================================
*/

/*
  GET /api/categories

  Objetivo:
  - listar categorias principais e subcategorias em uma resposta unica

  Retorno:
  - array com:
    id, name, slug, icon_url, display_order, is_visible, parent_id

  Observacao:
  - categorias principais recebem parent_id = null
  - subcategorias usam category_id como parent_id
*/
app.get('/api/categories', async (req, res) => {
  try {
    const query = `
      SELECT id, name, slug, icon_url, display_order, is_visible, NULL as parent_id
      FROM categorias
      UNION ALL
      SELECT id, name, slug, NULL as icon_url, display_order, IFNULL(is_visible, 1) as is_visible, category_id as parent_id
      FROM sub_categorias
      ORDER BY display_order
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
  POST /api/categories

  Objetivo:
  - criar categoria principal ou subcategoria

  Body esperado:
  - name
  - slug
  - is_visible
  - parent_id (opcional)
  - icon (arquivo, opcional para categoria principal)

  Regra:
  - se parent_id existir, cria subcategoria
  - se parent_id nao existir, cria categoria principal
*/
app.post('/api/categories', upload.single('icon'), async (req, res) => {
  try {
    const { name, slug, is_visible, parent_id } = req.body;
    const icon_url = req.file ? `/img/${req.file.filename}` : null;
    const visible = (is_visible === 'true' || is_visible === true || is_visible === 1) ? 1 : 0;

    if (parent_id && parent_id !== 'null' && parent_id !== '') {
      await db.query(
        'INSERT INTO sub_categorias (category_id, name, slug, display_order) VALUES (?, ?, ?, ?)',
        [Number(parent_id), safe(name) || '', safe(slug) || '', 0]
      );
      res.status(201).json({ message: 'Subcategoria criada!' });
      return;
    }

    await db.query(
      'INSERT INTO categorias (name, slug, icon_url, display_order, is_visible) VALUES (?, ?, ?, ?, ?)',
      [safe(name) || '', safe(slug) || '', safe(icon_url), 0, visible]
    );
    res.status(201).json({ message: 'Categoria criada!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
  PUT /api/categories/:id

  Objetivo:
  - atualizar categoria principal ou subcategoria

  Params:
  - id

  Body esperado:
  - name
  - slug
  - is_visible
  - parent_id (opcional)
  - icon (arquivo opcional)

  Regra:
  - se parent_id existir, atualiza subcategoria
  - se parent_id nao existir, atualiza categoria principal
*/
app.put('/api/categories/:id', upload.single('icon'), async (req, res) => {
  try {
    const { name, slug, is_visible, parent_id } = req.body;
    const visible = (is_visible === 'true' || is_visible === true || is_visible === 1) ? 1 : 0;
    const id = req.params.id;

    if (parent_id && parent_id !== 'null' && parent_id !== '') {
      await db.query(
        'UPDATE sub_categorias SET name = ?, slug = ?, category_id = ?, is_visible = ? WHERE id = ?',
        [safe(name) || '', safe(slug) || '', Number(parent_id), visible, id]
      );
      res.json({ message: 'Subcategoria atualizada!' });
      return;
    }

    let query = 'UPDATE categorias SET name = ?, slug = ?, is_visible = ?';
    const params = [safe(name) || '', safe(slug) || '', visible];

    if (req.file) {
      query += ', icon_url = ?';
      params.push(`/img/${req.file.filename}`);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await db.query(query, params.map(safe));
    res.json({ message: 'Categoria atualizada!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
  DELETE /api/categories/:id

  Objetivo:
  - excluir categoria ou subcategoria pelo id

  Params:
  - id

  Regra atual:
  - tenta remover primeiro de sub_categorias
  - depois tenta remover de categorias
*/
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const id = req.params.id;

    await db.query('DELETE FROM sub_categorias WHERE id = ?', [id]);
    await db.query('DELETE FROM categorias WHERE id = ?', [id]);

    res.json({ message: 'Categoria/Subcategoria excluida com sucesso!' });
  } catch (err) {
    console.error('ERRO AO EXCLUIR CATEGORIA:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/*
  ============================================================
  BANNERS
  ============================================================
*/

/*
  GET /api/banners

  Objetivo:
  - listar todos os banners

  Ordenacao:
  - display_order ASC
*/
app.get('/api/banners', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM banners ORDER BY display_order ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
  POST /api/banners

  Objetivo:
  - criar um banner

  Body esperado:
  - title
  - link_url
  - display_order
  - active
  - image (arquivo obrigatorio)
*/
app.post('/api/banners', upload.single('image'), async (req, res) => {
  try {
    const { title, link_url, display_order, active } = req.body;
    const image_url = req.file ? `/img/${req.file.filename}` : null;

    if (!image_url) {
      return res.status(400).json({ error: 'A imagem do banner e obrigatoria.' });
    }

    const isActive = (active === 'true' || active === true || active === 1) ? 1 : 0;
    const order = display_order ? parseInt(display_order, 10) : 0;

    await db.query(
      'INSERT INTO banners (image_url, title, link_url, display_order, active) VALUES (?, ?, ?, ?, ?)',
      [image_url, safe(title), safe(link_url), order, isActive]
    );
    res.status(201).json({ message: 'Banner criado!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
  PUT /api/banners/:id

  Objetivo:
  - atualizar um banner existente

  Params:
  - id

  Body esperado:
  - title
  - link_url
  - display_order
  - active
  - image (arquivo opcional)
*/
app.put('/api/banners/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, link_url, display_order, active } = req.body;
    const id = req.params.id;
    const isActive = (active === 'true' || active === true || active === 1) ? 1 : 0;
    const order = display_order ? parseInt(display_order, 10) : 0;

    let query = 'UPDATE banners SET title = ?, link_url = ?, display_order = ?, active = ?';
    const params = [safe(title), safe(link_url), order, isActive];

    if (req.file) {
      query += ', image_url = ?';
      params.push(`/img/${req.file.filename}`);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await db.query(query, params);
    res.json({ message: 'Banner atualizado!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
  DELETE /api/banners/:id

  Objetivo:
  - excluir um banner pelo id
*/
app.delete('/api/banners/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM banners WHERE id = ?', [req.params.id]);
    res.json({ message: 'Banner excluido!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
  ============================================================
  PRODUTOS
  ============================================================
*/

/*
  GET /api/products

  Objetivo:
  - listar todos os produtos

  Retorno:
  - dados do produto
  - nomes das categorias concatenados em category_names
  - ids das categorias em category_ids
  - flags booleanas das secoes especiais
*/
app.get('/api/products', async (req, res) => {
  try {
    const query = `
      SELECT p.*,
             (SELECT GROUP_CONCAT(name SEPARATOR ', ') FROM (
                 SELECT name, product_id FROM categorias c JOIN product_categorias pc ON c.id = pc.category_id
                 UNION ALL
                 SELECT name, product_id FROM sub_categorias sc JOIN product_sub_categorias psc ON sc.id = psc.sub_category_id
             ) as combined WHERE combined.product_id = p.id) as category_names,
             (SELECT GROUP_CONCAT(id) FROM (
                 SELECT c.id, pc.product_id FROM categorias c JOIN product_categorias pc ON c.id = pc.category_id
                 UNION ALL
                 SELECT sc.id, psc.product_id FROM sub_categorias sc JOIN product_sub_categorias psc ON sc.id = psc.sub_category_id
             ) as combined_ids WHERE combined_ids.product_id = p.id) as category_ids
      FROM products p
      ORDER BY p.id DESC
    `;

    const [rows] = await db.query(query);
    const formattedRows = rows.map((row) => ({
      ...row,
      category_ids: row.category_ids ? row.category_ids.split(',').map(Number) : [],
      is_upcera: row.is_upcera === 1,
      is_scanner: row.is_scanner === 1,
      is_3d_printer: row.is_3d_printer === 1
    }));

    res.json(formattedRows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
  GET /api/products/:id

  Objetivo:
  - buscar um produto especifico pelo id

  Params:
  - id
*/
app.get('/api/products/:id', async (req, res) => {
  try {
    const query = `
      SELECT p.*,
             (SELECT GROUP_CONCAT(name SEPARATOR ', ') FROM (
                 SELECT name, product_id FROM categorias c JOIN product_categorias pc ON c.id = pc.category_id
                 UNION ALL
                 SELECT name, product_id FROM sub_categorias sc JOIN product_sub_categorias psc ON sc.id = psc.sub_category_id
             ) as combined WHERE combined.product_id = p.id) as category_names,
             (SELECT GROUP_CONCAT(id) FROM (
                 SELECT c.id, pc.product_id FROM categorias c JOIN product_categorias pc ON c.id = pc.category_id
                 UNION ALL
                 SELECT sc.id, psc.product_id FROM sub_categorias sc JOIN product_sub_categorias psc ON sc.id = psc.sub_category_id
             ) as combined_ids WHERE combined_ids.product_id = p.id) as category_ids
      FROM products p
      WHERE p.id = ?
    `;

    const [rows] = await db.query(query, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Produto nao encontrado' });
    }

    const product = {
      ...rows[0],
      category_ids: rows[0].category_ids ? rows[0].category_ids.split(',').map(Number) : []
    };

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
  POST /api/products

  Objetivo:
  - criar um novo produto

  Body esperado:
  - name
  - description
  - category_ids (JSON string ou array)
  - extra_data (JSON string ou objeto)
  - images (multiplos arquivos)

  Fluxo:
  - abre transacao
  - salva produto
  - salva imagens no extra_data
  - cria vinculacao com categorias e subcategorias
  - commit
*/
app.post('/api/products', upload.array('images', 20), async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { name, category_ids, description, extra_data } = req.body;
    const files = req.files || [];
    const imagePaths = files.map((file) => `/img/${file.filename}`);
    const main_image = imagePaths.length > 0 ? imagePaths[0] : null;

    let extra = {};
    try {
      extra = typeof extra_data === 'string' ? JSON.parse(extra_data) : (extra_data || {});
    } catch (e) {
      extra = {};
    }
    extra.images = imagePaths;

    const [result] = await connection.query(
      'INSERT INTO products (name, description, main_image, extra_data) VALUES (?, ?, ?, ?)',
      [safe(name) || '', safe(description) || '', safe(main_image), JSON.stringify(extra)]
    );

    const productId = result.insertId;

    if (category_ids) {
      let ids = [];
      try {
        ids = typeof category_ids === 'string' ? JSON.parse(category_ids) : category_ids;
      } catch (e) {
        ids = [];
      }

      if (!Array.isArray(ids)) ids = [ids];

      const validIds = Array.from(new Set(ids.filter((id) => id && !isNaN(id)).map(Number)));

      if (validIds.length > 0) {
        const [cats] = await connection.query('SELECT id FROM categorias WHERE id IN (?)', [validIds]);
        const [subs] = await connection.query('SELECT id FROM sub_categorias WHERE id IN (?)', [validIds]);

        const catIdsFound = cats.map((c) => c.id);
        const subIdsFound = subs.map((s) => s.id);

        if (catIdsFound.length > 0) {
          const values = catIdsFound.map((id) => [productId, id]);
          await connection.query('INSERT INTO product_categorias (product_id, category_id) VALUES ?', [values]);
        }

        if (subIdsFound.length > 0) {
          const values = subIdsFound.map((id) => [productId, id]);
          await connection.query('INSERT INTO product_sub_categorias (product_id, sub_category_id) VALUES ?', [values]);
        }
      }
    }

    await connection.commit();
    res.status(201).json({ message: 'Produto criado!' });
  } catch (err) {
    await connection.rollback();
    console.error('ERRO NO POST PRODUCT:', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

/*
  PUT /api/products/:id

  Objetivo:
  - atualizar um produto existente

  Params:
  - id

  Body esperado:
  - name
  - description
  - category_ids
  - extra_data
  - images (novas imagens opcionais)

  Fluxo:
  - abre transacao
  - atualiza dados base
  - atualiza imagens se houver upload novo
  - remove relacoes antigas de categoria
  - recria relacoes validas
  - commit
*/
app.put('/api/products/:id', upload.array('images', 20), async (req, res) => {
  const connection = await db.getConnection();
  const productId = Number(req.params.id);

  try {
    await connection.beginTransaction();

    const name = req.body.name || '';
    const description = req.body.description || '';
    const category_ids = req.body.category_ids;
    const extra_data = req.body.extra_data;

    const files = req.files || [];
    const newImagePaths = files.map((file) => `/img/${file.filename}`);

    let extra = {};
    try {
      extra = typeof extra_data === 'string' ? JSON.parse(extra_data) : (extra_data || {});
    } catch (e) {
      extra = {};
    }

    let query = 'UPDATE products SET name=?, description=?, extra_data=?';
    const params = [safe(name), safe(description), JSON.stringify(extra)];

    if (newImagePaths.length > 0) {
      extra.images = newImagePaths;
      params[2] = JSON.stringify(extra);
      query += ', main_image=?';
      params.push(safe(newImagePaths[0]));
    }

    query += ' WHERE id=?';
    params.push(productId);

    await connection.query(query, params.map((val) => (val === undefined ? null : val)));

    if (category_ids) {
      let ids = [];
      try {
        ids = typeof category_ids === 'string' ? JSON.parse(category_ids) : category_ids;
      } catch (e) {
        ids = [];
      }

      if (!Array.isArray(ids)) ids = [ids];

      const validIds = Array.from(new Set(ids.filter((id) => id && !isNaN(id)).map(Number)));

      await connection.query('DELETE FROM product_categorias WHERE product_id = ?', [productId]);
      await connection.query('DELETE FROM product_sub_categorias WHERE product_id = ?', [productId]);

      if (validIds.length > 0) {
        const [cats] = await connection.query('SELECT id FROM categorias WHERE id IN (?)', [validIds]);
        const [subs] = await connection.query('SELECT id FROM sub_categorias WHERE id IN (?)', [validIds]);

        const catIdsFound = cats.map((c) => c.id);
        const subIdsFound = subs.map((s) => s.id);

        if (catIdsFound.length > 0) {
          const values = catIdsFound.map((id) => [productId, id]);
          await connection.query('INSERT INTO product_categorias (product_id, category_id) VALUES ?', [values]);
        }

        if (subIdsFound.length > 0) {
          const values = subIdsFound.map((id) => [productId, id]);
          await connection.query('INSERT INTO product_sub_categorias (product_id, sub_category_id) VALUES ?', [values]);
        }
      }
    }

    await connection.commit();
    res.json({ message: 'Produto atualizado!' });
  } catch (err) {
    await connection.rollback();
    console.error('ERRO NO UPDATE PRODUCT:', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

/*
  DELETE /api/products/:id

  Objetivo:
  - excluir um produto pelo id
*/
app.delete('/api/products/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Produto excluido!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
  ============================================================
  SECOES ESPECIAIS
  ============================================================
*/

/*
  PUT /api/upcera/products

  Objetivo:
  - definir quais produtos aparecem na secao Upcera

  Body esperado:
  - selected_products: [{ id, order }]
*/
app.put('/api/upcera/products', async (req, res) => {
  try {
    const { selected_products } = req.body;

    if (!Array.isArray(selected_products)) {
      return res.status(400).json({ error: 'O campo selected_products deve ser um array.' });
    }

    await db.query('UPDATE products SET is_upcera = FALSE, upcera_order = 0');

    for (const item of selected_products) {
      await db.query('UPDATE products SET is_upcera = TRUE, upcera_order = ? WHERE id = ?', [item.order || 0, item.id]);
    }

    res.json({ message: 'Produtos Upcera atualizados com sucesso!' });
  } catch (err) {
    console.error('ERRO AO SALVAR UPCERA NO BACKEND:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/*
  PUT /api/scanners/products

  Objetivo:
  - definir quais produtos aparecem na secao Scanners

  Body esperado:
  - selected_products: [{ id, order }]
*/
app.put('/api/scanners/products', async (req, res) => {
  try {
    const { selected_products } = req.body;

    if (!Array.isArray(selected_products)) {
      return res.status(400).json({ error: 'O campo selected_products deve ser um array.' });
    }

    await db.query('UPDATE products SET is_scanner = FALSE, scanner_order = 0');

    for (const item of selected_products) {
      await db.query('UPDATE products SET is_scanner = TRUE, scanner_order = ? WHERE id = ?', [item.order || 0, item.id]);
    }

    res.json({ message: 'Produtos Scanners atualizados com sucesso!' });
  } catch (err) {
    console.error('ERRO AO SALVAR SCANNERS NO BACKEND:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/*
  PUT /api/3d-printers/products

  Objetivo:
  - definir quais produtos aparecem na secao Impressoras 3D

  Body esperado:
  - selected_products: [{ id, order }]
*/
app.put('/api/3d-printers/products', async (req, res) => {
  try {
    const { selected_products } = req.body;

    if (!Array.isArray(selected_products)) {
      return res.status(400).json({ error: 'O campo selected_products deve ser um array.' });
    }

    await db.query('UPDATE products SET is_3d_printer = FALSE, printer_order = 0');

    for (const item of selected_products) {
      await db.query('UPDATE products SET is_3d_printer = TRUE, printer_order = ? WHERE id = ?', [item.order || 0, item.id]);
    }

    res.json({ message: 'Produtos Impressoras 3D atualizados com sucesso!' });
  } catch (err) {
    console.error('ERRO AO SALVAR IMPRESSORAS 3D NO BACKEND:', err);
    res.status(500).json({ error: `Erro no banco de dados: ${err.message}` });
  }
});

/*
  ============================================================
  INICIALIZACAO DO SERVIDOR
  ============================================================
*/
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
