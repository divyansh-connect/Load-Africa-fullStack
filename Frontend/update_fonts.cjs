const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = false;

            // Regex to match <h1... className="..."> and replace font-bold or font-extrabold with font-black
            const regex = /(<h[12][^>]*className=["'][^"']*)(font-bold|font-extrabold)([^"']*["'][^>]*>)/g;
            
            if (regex.test(content)) {
                content = content.replace(regex, '$1font-black$3');
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated:', fullPath);
            }
        }
    }
}

processDirectory(srcDir);
console.log('Done.');
