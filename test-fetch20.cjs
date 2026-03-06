const fs = require('fs');
const html = fs.readFileSync('result.html', 'utf8');
const matches = html.match(/<td[^>]*>.*?<\/td>/gs);
if (matches) {
  console.log(matches.slice(0, 20).join('\n'));
}
