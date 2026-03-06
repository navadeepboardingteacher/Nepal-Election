const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('ratopati.html', 'utf8');
const $ = cheerio.load(html);

const classes = new Set();
$('*').each((i, el) => {
  const cls = $(el).attr('class');
  if (cls) {
    cls.split(/\s+/).forEach(c => classes.add(c));
  }
});

console.log('Classes:', Array.from(classes).filter(c => c.includes('party') || c.includes('lead') || c.includes('win') || c.includes('item')).slice(0, 20));
