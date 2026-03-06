const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('ratopati.html', 'utf8');
const $ = cheerio.load(html);

const scripts = $('script').map((i, el) => $(el).attr('src')).get();
console.log('Scripts:', scripts);

const apiCalls = html.match(/fetch\(['"](.*?)['"]/g) || html.match(/\$\.ajax\(\{.*?url:\s*['"](.*?)['"]/g) || html.match(/\$\.get\(['"](.*?)['"]/g);
console.log('API Calls:', apiCalls);
