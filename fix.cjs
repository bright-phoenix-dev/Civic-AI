const fs = require('fs');
const path = require('path');
const dir = './src/views';
fs.readdirSync(dir).forEach(file => {
  if(file.endsWith('.jsx')) {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    content = content.replace(/from\s+['"]\.\/ui\/([^'"]+)['"]/g, "from '../components/ui/$1'");
    fs.writeFileSync(path.join(dir, file), content);
  }
});
console.log("Done");
