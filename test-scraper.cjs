const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('ratopati.html', 'utf8');
const $ = cheerio.load(html);

const parties = [];
$('.parties-card').each((i, el) => {
  const name = $(el).find('.title').text().trim();
  const img = $(el).find('img').attr('src');
  
  const ths = $(el).find('table th').map((i, th) => $(th).text().trim()).get();
  const tds = $(el).find('table td').map((i, td) => $(td).text().trim()).get();
  
  let win = 0;
  let lead = 0;
  
  ths.forEach((th, idx) => {
    if (th === 'विजयी') win = parseInt(tds[idx]) || 0;
    if (th === 'अग्रता') lead = parseInt(tds[idx]) || 0;
  });
  
  if (name) {
    parties.push({ name, img, win, lead });
  }
});

console.log('Parties:', parties);

const candidates = [];
$('.hot-seat-item').each((i, el) => {
  const name = $(el).find('.name').text().trim();
  const img = $(el).find('img').attr('src');
  const party = $(el).find('.party').text().trim();
  const votes = $(el).find('.vote').text().trim();
  const area = $(el).find('.area').text().trim();
  
  if (name) {
    candidates.push({ name, img, party, votes, area });
  }
});

console.log('Candidates:', candidates);
