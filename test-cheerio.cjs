const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('ratopati.html', 'utf8');
const $ = cheerio.load(html);

const parties = [];
$('.party-list, .party-item, .item, .col-md-3, .col-lg-3').each((i, el) => {
  const name = $(el).find('h3, h4, .name, .title').text().trim();
  const img = $(el).find('img').attr('src');
  const links = $(el).find('a').map((i, a) => $(a).attr('href')).get();
  const text = $(el).text().replace(/\s+/g, ' ').trim();
  
  if (name && img && text.includes('जित')) {
    parties.push({ name, img, links, text });
  }
});

console.log('Parties found:', parties.length);
if (parties.length > 0) {
  console.log(parties.slice(0, 3));
} else {
  // Let's try to find any image that looks like a party logo
  $('img').each((i, el) => {
    const src = $(el).attr('src');
    if (src && src.includes('logo')) {
      console.log('Logo:', src, $(el).parent().text().trim());
    }
  });
}
