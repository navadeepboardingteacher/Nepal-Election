const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('ratopati.html', 'utf8');
const $ = cheerio.load(html);

const parties = [];
$('a[href*="/party/"]').each((i, el) => {
  const parent = $(el).parent().parent();
  const name = $(el).text().trim();
  const img = $(el).find('img').attr('src');
  const text = parent.text().replace(/\s+/g, ' ').trim();
  
  if (name || img) {
    parties.push({ name, img, text });
  }
});

console.log(parties.slice(0, 10));
