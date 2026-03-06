const https = require('https');

https.get('https://election.ratopati.com/api/address/province', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const parsed = JSON.parse(data);
    console.log(parsed.data.map(p => ({ id: p.id, name: p.name })));
  });
}).on('error', (err) => {
  console.error(err);
});
