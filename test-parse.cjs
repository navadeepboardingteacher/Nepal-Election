const fs = require('fs');
const html = fs.readFileSync('ratopati.html', 'utf8');

// Try to find party data in the HTML
const partyMatches = html.match(/<div class="party-name">.*?<\/div>/gi);
console.log('Parties:', partyMatches ? partyMatches.slice(0, 5) : 'None');

const scriptMatches = html.match(/<script.*?>.*?<\/script>/gi);
if (scriptMatches) {
  scriptMatches.forEach(s => {
    if (s.includes('var ') || s.includes('const ') || s.includes('let ')) {
      console.log('Script with vars:', s.substring(0, 100));
    }
  });
}
