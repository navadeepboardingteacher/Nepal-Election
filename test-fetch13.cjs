const https = require('https');

https.get('https://election.ratopati.com/api/candidates?limit=1', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const parsed = JSON.parse(data);
    console.log(JSON.stringify(parsed.data[0], null, 2));
  });
}).on('error', (err) => {
  console.error(err);
});
