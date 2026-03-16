const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Configuração do Multer (Salva fotos em frontend/public/img)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../frontend/public/img'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// FUNÇÃO DE LIMPEZA RADICAL: Transforma QUALQUER undefined em null
const safe = (val) => (val === undefined ? null : val);

// --- ROTAS DE CATEGORIAS ---

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

app.post('/api/categories', upload.single('icon'), async (req, res) => {
    try {
        const { name, slug, is_visible, parent_id } = req.body;
        const icon_url = req.file ? `/img/${req.file.filename}` : null;
        const visible = (is_visible === 'true' || is_visible === true || is_visible === 1) ? 1 : 0;
        
        if (parent_id && parent_id !== 'null' && parent_id !== '') {
            // É uma subcategoria
            await db.query(
                'INSERT INTO sub_categorias (category_id, name, slug, display_order) VALUES (?, ?, ?, ?)',
                [Number(parent_id), safe(name) || '', safe(slug) || '', 0]
            );
            res.status(201).json({ message: "Subcategoria criada!" });
        } else {
            // É uma categoria principal
            await db.query(
                'INSERT INTO categorias (name, slug, icon_url, display_order, is_visible) VALUES (?, ?, ?, ?, ?)',
                [safe(name) || '', safe(slug) || '', safe(icon_url), 0, visible]
            );
            res.status(201).json({ message: "Categoria criada!" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/categories/:id', upload.single('icon'), async (req, res) => {
    try {
        const { name, slug, is_visible, parent_id } = req.body;
        const visible = (is_visible === 'true' || is_visible === true || is_visible === 1) ? 1 : 0;
        const id = req.params.id;

        if (parent_id && parent_id !== 'null' && parent_id !== '') {
            // Atualizar subcategoria
            await db.query(
                'UPDATE sub_categorias SET name = ?, slug = ?, category_id = ?, is_visible = ? WHERE id = ?',
                [safe(name) || '', safe(slug) || '', Number(parent_id), visible, id]
            );
            res.json({ message: "Subcategoria atualizada!" });
        } else {
            // Atualizar categoria principal
            let query = 'UPDATE categorias SET name = ?, slug = ?, is_visible = ?';
            let params = [safe(name) || '', safe(slug) || '', visible];

            if (req.file) {
                query += ', icon_url = ?';
                params.push(`/img/${req.file.filename}`);
            }
            query += ' WHERE id = ?';
            params.push(id);

            await db.query(query, params.map(safe));
            res.json({ message: "Categoria atualizada!" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ROTAS DE PRODUTOS ---

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
        const formattedRows = rows.map(row => ({
            ...row,
            category_ids: row.category_ids ? row.category_ids.split(',').map(Number) : []
        }));
        res.json(formattedRows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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
        if (rows.length === 0) return res.status(404).json({ error: "Produto não encontrado" });
        
        const product = {
            ...rows[0],
            category_ids: rows[0].category_ids ? rows[0].category_ids.split(',').map(Number) : []
        };
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', upload.array('images', 20), async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { name, category_ids, description, extra_data } = req.body;
        const files = req.files || [];
        const imagePaths = files.map(file => `/img/${file.filename}`);
        const main_image = imagePaths.length > 0 ? imagePaths[0] : null;

        let extra = {};
        try { extra = typeof extra_data === 'string' ? JSON.parse(extra_data) : (extra_data || {}); } catch (e) {}
        extra.images = imagePaths;

        const [result] = await connection.query(
            'INSERT INTO products (name, description, main_image, extra_data) VALUES (?, ?, ?, ?)',
            [safe(name) || '', safe(description) || '', safe(main_image), JSON.stringify(extra)]
        );

        const productId = result.insertId;
        if (category_ids) {
            let ids = [];
            try { ids = typeof category_ids === 'string' ? JSON.parse(category_ids) : category_ids; } catch (e) {}
            if (!Array.isArray(ids)) ids = [ids];
            const validIds = Array.from(new Set(ids.filter(id => id && !isNaN(id)).map(Number)));
            
            if (validIds.length > 0) {
                // Descobrir quais IDs pertencem a quais tabelas para evitar erros de FK
                const [cats] = await connection.query('SELECT id FROM categorias WHERE id IN (?)', [validIds]);
                const [subs] = await connection.query('SELECT id FROM sub_categorias WHERE id IN (?)', [validIds]);
                
                const catIdsFound = cats.map(c => c.id);
                const subIdsFound = subs.map(s => s.id);

                if (catIdsFound.length > 0) {
                    const values = catIdsFound.map(id => [productId, id]);
                    await connection.query('INSERT INTO product_categorias (product_id, category_id) VALUES ?', [values]);
                }
                if (subIdsFound.length > 0) {
                    const values = subIdsFound.map(id => [productId, id]);
                    await connection.query('INSERT INTO product_sub_categorias (product_id, sub_category_id) VALUES ?', [values]);
                }
            }
        }
        await connection.commit();
        res.status(201).json({ message: "Produto criado!" });
    } catch (err) {
        await connection.rollback();
        console.error("ERRO NO POST PRODUCT:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

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
        const newImagePaths = files.map(file => `/img/${file.filename}`);

        let extra = {};
        try { 
            extra = typeof extra_data === 'string' ? JSON.parse(extra_data) : (extra_data || {}); 
        } catch (e) { extra = {}; }

        let query = "UPDATE products SET name=?, description=?, extra_data=?";
        let params = [safe(name), safe(description), JSON.stringify(extra)];

        if (newImagePaths.length > 0) {
            extra.images = newImagePaths;
            params[2] = JSON.stringify(extra);
            query += ", main_image=?";
            params.push(safe(newImagePaths[0]));
        }

        query += " WHERE id=?";
        params.push(productId);

        await connection.query(query, params.map(val => (val === undefined ? null : val)));

        if (category_ids) {
            let ids = [];
            try { 
                ids = typeof category_ids === 'string' ? JSON.parse(category_ids) : category_ids; 
            } catch (e) { ids = []; }
            
            if (!Array.isArray(ids)) ids = [ids];
            const validIds = Array.from(new Set(ids.filter(id => id && !isNaN(id)).map(Number)));
            
            // Limpa associações antigas
            await connection.query('DELETE FROM product_categorias WHERE product_id = ?', [productId]);
            await connection.query('DELETE FROM product_sub_categorias WHERE product_id = ?', [productId]);
            
            if (validIds.length > 0) {
                // Filtra IDs que realmente existem nas tabelas pai
                const [cats] = await connection.query('SELECT id FROM categorias WHERE id IN (?)', [validIds]);
                const [subs] = await connection.query('SELECT id FROM sub_categorias WHERE id IN (?)', [validIds]);
                
                const catIdsFound = cats.map(c => c.id);
                const subIdsFound = subs.map(s => s.id);

                if (catIdsFound.length > 0) {
                    const values = catIdsFound.map(id => [productId, id]);
                    await connection.query('INSERT INTO product_categorias (product_id, category_id) VALUES ?', [values]);
                }
                if (subIdsFound.length > 0) {
                    const values = subIdsFound.map(id => [productId, id]);
                    await connection.query('INSERT INTO product_sub_categorias (product_id, sub_category_id) VALUES ?', [values]);
                }
            }
        }

        await connection.commit();
        res.json({ message: "Produto atualizado!" });
    } catch (err) {
        await connection.rollback();
        console.error("ERRO NO UPDATE PRODUCT:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

app.delete('/api/categories/:id', async (req, res) => {
    try {
        const id = req.params.id;
        // Tenta deletar de ambas, uma delas vai afetar 0 linhas se não existir
        await db.query('DELETE FROM sub_categorias WHERE id = ?', [id]);
        await db.query('DELETE FROM categorias WHERE id = ?', [id]);
        
        res.json({ message: "Categoria/Subcategoria excluída com sucesso!" });
    } catch (err) {
        console.error("ERRO AO EXCLUIR CATEGORIA:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: "Produto excluído!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
