/**
 * Cria a tabela home_services para gerenciar os quadros da Home (Moby Work, Talmax Digital, etc).
 */
const db = require('../../config/database');

async function createTable() {
    try {
        console.log("Criando tabela home_services...");
        
        await db.query(`
            CREATE TABLE IF NOT EXISTS home_services (
                id INT NOT NULL AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                image_url VARCHAR(255) DEFAULT NULL,
                link_url VARCHAR(255) DEFAULT NULL,
                is_external BOOLEAN DEFAULT FALSE,
                display_order INT DEFAULT 0,
                active BOOLEAN DEFAULT TRUE,
                actions JSON DEFAULT NULL,
                created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log("Tabela home_services criada com sucesso!");

        // Inserir dados iniciais do data.js
        const initialServices = [
            {
                name: 'Moby Work',
                description: 'Conheca a linha de moveis e projetos planejados para clinicas e laboratorios.',
                image_url: '/img/mobywork.png',
                link_url: 'https://mobywork.com.br',
                is_external: true,
                display_order: 1,
                actions: JSON.stringify([{ label: 'Acessar Site', href: 'https://mobywork.com.br', external: true }])
            },
            {
                name: 'Talmax Digital',
                description: 'Explore nossas solucoes digitais e tecnologias para fluxo CAD/CAM odontologico.',
                image_url: '/img/talmaxdigita1.png',
                link_url: '/categoria/talmax-digital',
                is_external: false,
                display_order: 2,
                actions: JSON.stringify([{ label: 'Ver Solucoes', href: '/categoria/talmax-digital' }])
            },
            {
                name: 'Cursos',
                description: 'Acesse treinamentos, atualizacoes e conteudos para evoluir com a Talmax.',
                image_url: '/img/cursostalmax.png',
                link_url: '/cursos',
                is_external: false,
                display_order: 3,
                actions: JSON.stringify([{ label: 'Ver Cursos', href: '/cursos' }])
            },
            {
                name: 'Serviços',
                description: 'Escolha o canal ideal para atendimento especializado e suporte da Talmax.',
                image_url: '/img/testeservicos.png',
                link_url: '/suporte',
                is_external: false,
                display_order: 4,
                actions: JSON.stringify([
                    { label: 'Assistencia Tecnica', href: '/assistencia-tecnica' },
                    { label: 'Suporte', href: '/suporte' }
                ])
            }
        ];

        for (const service of initialServices) {
            const [rows] = await db.query('SELECT id FROM home_services WHERE name = ?', [service.name]);
            if (rows.length === 0) {
                await db.query('INSERT INTO home_services SET ?', service);
                console.log(`Serviço inserido: ${service.name}`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error("Erro ao criar/popular tabela home_services:", err);
        process.exit(1);
    }
}

createTable();
