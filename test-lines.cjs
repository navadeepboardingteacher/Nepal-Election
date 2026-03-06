const fs = require('fs');
const html = fs.readFileSync('ratopati.html', 'utf8');
const lines = html.split('\n');
const partyLines = lines.filter(l => l.toLowerCase().includes('party') || l.toLowerCase().includes('congress') || l.toLowerCase().includes('uml'));
console.log(partyLines.slice(0, 10).join('\n'));
