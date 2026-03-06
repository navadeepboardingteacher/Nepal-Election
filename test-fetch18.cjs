const fs = require('fs');
const html = fs.readFileSync('result.html', 'utf8');
console.log(html.substring(0, 1000));
