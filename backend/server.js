const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuração do CORS (para o React conseguir falar com o Node)
app.use(cors());
app.use(express.json());

// Configuração do Multer (Para salvar as FOTOS na pasta /img)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // As fotos vão para a pasta public/img do seu frontend
        cb(null, path.join(__dirname, '../frontend/public/img'));
    },
    filename: (req, file, cb) => {
        // Nome da foto: timestamp + nome original (ex: 123456-pedra-ninja.jpg)
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// --- ROTAS DO BANCO DE DADOS ---

// 1. Rota para Buscar TODAS as Categorias
app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categories ORDER BY display_order');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Rota para Buscar TODOS os Produtos
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

// 2.1 Rota para Buscar um ÚNICO Produto pelo ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const query = `
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `;
        const [rows] = await db.query(query, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: "Produto não encontrado" });
        }
        
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Rota para Salvar Novo Produto
app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        const { name, category_id, description, extra_data } = req.body;
        const main_image = req.file ? `/img/${req.file.filename}` : null;

        const query = `
            INSERT INTO products (name, category_id, description, main_image, extra_data) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.execute(query, [
            name, 
            category_id, 
            description, 
            main_image, 
            extra_data 
        ]);

        res.status(201).json({ id: result.insertId, message: "Produto criado com sucesso!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Rota para ATUALIZAR Produto (Editar)
app.put('/api/products/:id', upload.single('image'), async (req, res) => {
    try {
        const { name, category_id, description, extra_data } = req.body;
        let query = `UPDATE products SET name=?, category_id=?, description=?, extra_data=?`;
        let params = [name, category_id, description, extra_data];

        // Se uma nova imagem foi enviada, atualizamos o caminho
        if (req.file) {
            query += `, main_image=?`;
            params.push(`/img/${req.file.filename}`);
        }

        query += ` WHERE id=?`;
        params.push(req.params.id);

        await db.execute(query, params);
        res.json({ message: "Produto atualizado com sucesso!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Rota para EXCLUIR Produto
app.delete('/api/products/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: "Produto excluído com sucesso!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Inicializando o Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
