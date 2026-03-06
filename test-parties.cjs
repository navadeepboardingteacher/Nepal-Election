const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('ratopati.html', 'utf8');
const $ = cheerio.load(html);

const parties = [];
$('.parties-card').each((i, el) => {
  const name = $(el).find('.title').text().trim();
  const img = $(el).find('img').attr('src');
  
  const stats = [];
  $(el).find('table tr').each((j, tr) => {
    const label = $(tr).find('th').text().trim();
    const count = $(tr).find('td').text().trim();
    if (label && count) {
      stats.push({ label, count });
    }
  });
  
  if (name) {
    parties.push({ name, img, stats });
  }
});

console.log(JSON.stringify(parties, null, 2));
