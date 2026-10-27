const fs = require('node:fs');
const path = require('node:path');
const output = path.join(__dirname, 'dist');
fs.mkdirSync(output, { recursive: true });
for (const name of ['index.html', 'style.css', 'app.js', 'source-library.js', 'course-ui.js', 'evidence-ui.js']) {
  fs.copyFileSync(path.join(__dirname, name), path.join(output, name));
}
for (const name of ['papers', 'lectures']) {
  fs.cpSync(path.join(__dirname, name), path.join(output, name), { recursive: true });
}
console.log('Static app prepared in dist/');
