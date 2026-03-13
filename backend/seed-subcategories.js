const db = require('./db');

function slugify(text) {
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

const subcategories = [
    // Ceras (ID: 109)
    { category_id: 109, name: 'Ceras Galileo' },
    { category_id: 109, name: 'Ceras Flex' },
    { category_id: 109, name: 'Equipamento para Cera' },
    { category_id: 109, name: 'Utilitários para Cera' },

    // Corte e Acabamento (ID: 114)
    { category_id: 114, name: 'Pedras Ninja - Para Metal' },
    { category_id: 114, name: 'Disco Ninja - Disco e Brocas Diamantada' },
    { category_id: 114, name: 'Borrachas Ninja' },
    { category_id: 114, name: 'Escovas Ninja' },
    { category_id: 114, name: 'Utilitário para Corte e Acabamento' },
    { category_id: 114, name: 'Pedras Ninja - Para Zircônia' },
    { category_id: 114, name: 'Brocas Sinterizadas' },

    // Equipamentos (ID: 116)
    { category_id: 116, name: 'Micromotores' },
    { category_id: 116, name: 'Fornos' },
    { category_id: 116, name: 'Microscópios - Lupas' },
    { category_id: 116, name: 'Fresadoras' },
    { category_id: 116, name: 'Ultra-som' },
    { category_id: 116, name: 'Aspiradores' },
    { category_id: 116, name: 'Poletriz' },
    { category_id: 116, name: 'Scanners de Mesa' },

    // Linha Cad/Cam (ID: 121)
    { category_id: 121, name: 'Fit Plus Cera - Aman' },
    { category_id: 121, name: 'Fit Plus Cera - Open' },
    { category_id: 121, name: 'Fit Plus Cera - ZZ' },
    { category_id: 121, name: 'Fit Plus ZR - Aman' },
    { category_id: 121, name: 'Fit Plus ZR - Open' },
    { category_id: 121, name: 'Fit Plus ZR - ZZ' },

    // Gesso e Troquelização (ID: 107)
    { category_id: 107, name: 'Gesso Tuff Rock' },
    { category_id: 107, name: 'Pinos de Troquel' },
    { category_id: 107, name: 'Pinos de Troquel in Box' },
    { category_id: 107, name: 'Troquelizadores' },
    { category_id: 107, name: 'Articuladores' },
    { category_id: 107, name: 'Impermeabilizante' },
    { category_id: 107, name: 'Espaçadores' },
    { category_id: 107, name: 'Isolante' },

    // Ligas Metálicas (ID: 112)
    { category_id: 112, name: 'Blocos e Núcleos - Ligas' },
    { category_id: 112, name: 'Metalocerâmica - Ligas' },
    { category_id: 112, name: 'PPR - Ligas' },
    { category_id: 112, name: 'Utilitários para Ligas (Cadinhos)' },

    // Linha de Ceramicas (ID: 122)
    { category_id: 122, name: 'Pincéis' },
    { category_id: 122, name: 'Godés' },
    { category_id: 122, name: 'Bases Refratárias' },

    // Revestimentos (ID: 110)
    { category_id: 110, name: 'Revestimentos - Fundição - Prensagem - Refratários' },
    { category_id: 110, name: 'Refratários' },
    { category_id: 110, name: 'Revestimento para Solda' },
    { category_id: 110, name: 'Silicone' },
    { category_id: 110, name: 'Utilitários para Fundição e Prensagem' },
    { category_id: 110, name: 'Micro Fit' },

    // Duplicadores (ID: 108)
    { category_id: 108, name: 'Duplicador - Fundição - Prensagem - Refratários' }, // Changed name slightly to avoid slug conflict if needed
    { category_id: 108, name: 'Refratários Duplicadores' },
    { category_id: 108, name: 'Revestimento para Solda Duplicadores' },
    { category_id: 108, name: 'Silicone Duplicadores' },
    { category_id: 108, name: 'Utilitários Duplicadores' },
    { category_id: 108, name: 'Micro Fit Duplicadores' },

    // Soldas (ID: 113)
    { category_id: 113, name: 'Metalocerâmica - Soldas' },
    { category_id: 113, name: 'PPR - Soldas' },
    { category_id: 113, name: 'Utilitários para Soldas' },

    // T-Lithium (ID: 118)
    { category_id: 118, name: 'Press' },
    { category_id: 118, name: 'Pad' },
    { category_id: 118, name: 'Acessórios T-Lithium' }
];

async function seedSubcategories() {
    try {
        console.log('--- Iniciando Seed de Subcategorias ---');
        
        for (const sub of subcategories) {
            const slug = slugify(sub.name);
            try {
                await db.query(
                    'INSERT INTO sub_categorias (category_id, name, slug) VALUES (?, ?, ?)',
                    [sub.category_id, sub.name, slug]
                );
                console.log(`✓ Inserida: ${sub.name}`);
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    // Try with a category prefix if slug exists
                    const newSlug = slugify(`${sub.name}-${sub.category_id}`);
                    await db.query(
                        'INSERT INTO sub_categorias (category_id, name, slug) VALUES (?, ?, ?)',
                        [sub.category_id, sub.name, newSlug]
                    );
                    console.log(`✓ Inserida (com prefixo): ${sub.name}`);
                } else {
                    console.error(`X Erro ao inserir ${sub.name}:`, err.message);
                }
            }
        }

        console.log('--- Seed Concluído! ---');
        process.exit(0);
    } catch (error) {
        console.error('X Falha no Seed:', error);
        process.exit(1);
    }
}

seedSubcategories();
