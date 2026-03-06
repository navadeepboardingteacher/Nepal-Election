const https = require('https');

https.get('https://election.ratopati.com/api/candidates?limit=100', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const parsed = JSON.parse(data);
    console.log("With limit=100:", parsed.data.length);
  });
}).on('error', (err) => {
  console.error(err);
});
