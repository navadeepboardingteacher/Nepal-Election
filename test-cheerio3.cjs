const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('ratopati.html', 'utf8');
const $ = cheerio.load(html);

const parties = [];
$('.party-list .item').each((i, el) => {
  const name = $(el).find('.name').text().trim();
  const img = $(el).find('img').attr('src');
  const win = $(el).find('.win').text().trim();
  const lead = $(el).find('.lead').text().trim();
  
  if (name) {
    parties.push({ name, img, win, lead });
  }
});

console.log('Parties:', parties);

// Let's also find the hot seats or popular candidates
const hotSeats = [];
$('.hot-seat-item').each((i, el) => {
  const name = $(el).find('.name').text().trim();
  const img = $(el).find('img').attr('src');
  if (name) {
    hotSeats.push({ name, img });
  }
});
console.log('Hot seats:', hotSeats);
