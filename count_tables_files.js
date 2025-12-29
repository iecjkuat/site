const fs = require('fs');
const path = require('path');

const supabaseDir = path.join(__dirname, 'supabase');
const tables = new Set();

try {
    const files = fs.readdirSync(supabaseDir);

    files.forEach(file => {
        if (path.extname(file) === '.sql') {
            const content = fs.readFileSync(path.join(supabaseDir, file), 'utf8');
            // Regex to find CREATE TABLE statements, handling IF NOT EXISTS
            const regex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-z0-9_]+)/gi;
            let match;
            while ((match = regex.exec(content)) !== null) {
                tables.add(match[1]);
            }
        }
    });

    console.log(`Found ${tables.size} unique tables.`);
    console.log('Tables:', Array.from(tables).join(', '));

} catch (err) {
    console.error('Error:', err);
}
