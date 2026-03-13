const db = require('./db');
async function checkSchema() {
    try {
        console.log("--- LISTING ALL TABLES ---");
        const [tables] = await db.query('SHOW TABLES');
        console.log(JSON.stringify(tables, null, 2));

        for (const tableRow of tables) {
            const tableName = Object.values(tableRow)[0];
            console.log(`\n--- DESCRIBING TABLE: ${tableName} ---`);
            const [columns] = await db.query(`DESCRIBE \`${tableName}\``);
            console.log(JSON.stringify(columns, null, 2));
            
            console.log(`\n--- SHOW CREATE TABLE: ${tableName} ---`);
            const [createTable] = await db.query(`SHOW CREATE TABLE \`${tableName}\``);
            console.log(createTable[0]['Create Table']);
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkSchema();
