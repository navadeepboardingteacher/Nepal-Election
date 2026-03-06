const fs = require('fs');
const html = fs.readFileSync('result.html', 'utf8');
const matches = html.match(/<table.*?<\/table>/s);
if (matches) {
  console.log(matches[0].substring(0, 1000));
} else {
  console.log("No tables found");
  const divs = html.match(/<div class="[^"]*result[^"]*".*?>/g);
  console.log(divs ? divs.slice(0, 10) : "No result divs");
}
