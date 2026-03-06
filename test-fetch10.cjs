const https = require('https');

https.get('https://election.ratopati.com/api/candidates', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const parsed = JSON.parse(data);
    console.log(Object.keys(parsed));
    if (parsed.meta) console.log(parsed.meta);
    if (parsed.links) console.log(parsed.links);
  });
}).on('error', (err) => {
  console.error(err);
});
