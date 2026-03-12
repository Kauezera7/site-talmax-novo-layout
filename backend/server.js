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

// --- ROTAS ---

app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categories ORDER BY display_order');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const query = `
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.id DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const query = `
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `;
        const [rows] = await db.query(query, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Produto não encontrado" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Criar Produto (POST)
app.post('/api/products', upload.array('images', 20), async (req, res) => {
    console.log("Recebendo novo produto...");
    try {
        const { name, category_id, description, extra_data } = req.body;
        
        const files = req.files || [];
        const imagePaths = files.map(file => `/img/${file.filename}`);
        const main_image = imagePaths.length > 0 ? imagePaths[0] : null;

        let extra = {};
        try {
            extra = typeof extra_data === 'string' ? JSON.parse(extra_data) : extra_data;
        } catch (e) { extra = {}; }
        
        // Adiciona a lista de imagens ao JSON dinâmico
        extra.images = imagePaths;

        const query = `
            INSERT INTO products (name, category_id, description, main_image, extra_data) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        await db.execute(query, [
            name, 
            category_id, 
            description, 
            main_image, 
            JSON.stringify(extra) 
        ]);

        console.log("✅ Produto cadastrado com sucesso!");
        res.status(201).json({ message: "Produto criado!" });
    } catch (err) {
        console.error("❌ Erro ao criar produto:", err);
        res.status(500).json({ error: err.message });
    }
});

// Atualizar Produto (PUT)
app.put('/api/products/:id', upload.array('images', 20), async (req, res) => {
    console.log(`Atualizando produto ID ${req.params.id}...`);
    try {
        const { name, category_id, description, extra_data } = req.body;
        const files = req.files || [];
        const newImagePaths = files.map(file => `/img/${file.filename}`);

        let extra = {};
        try {
            extra = typeof extra_data === 'string' ? JSON.parse(extra_data) : extra_data;
        } catch (e) { extra = {}; }

        // Parâmetros base da atualização
        let query = "UPDATE products SET name=?, category_id=?, description=?, extra_data=?";
        let params = [name, category_id, description];

        if (newImagePaths.length > 0) {
            // Se enviou fotos novas, atualizamos a lista de imagens
            extra.images = newImagePaths;
            query += ", main_image=?";
            params.push(JSON.stringify(extra)); // Para o campo extra_data
            params.push(newImagePaths[0]);      // Para o campo main_image
        } else {
            // Se NÃO enviou fotos novas, mantemos as antigas no extra_data 
            // que o front-end enviou de volta (se houver)
            params.push(JSON.stringify(extra));
        }

        query += " WHERE id=?";
        params.push(req.params.id);

        await db.execute(query, params);
        console.log("✅ Produto atualizado!");
        res.json({ message: "Produto atualizado!" });
    } catch (err) {
        console.error("❌ Erro ao atualizar produto:", err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: "Produto excluído!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
