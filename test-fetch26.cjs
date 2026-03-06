const https = require('https');

https.get('https://election.ratopati.com/api/address/district?province_id=1', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const parsed = JSON.parse(data);
    console.log(parsed.data.map(d => ({ id: d.id, name: d.name })).slice(0, 5));
  });
}).on('error', (err) => {
  console.error(err);
});
