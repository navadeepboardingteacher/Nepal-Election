const https = require('https');

https.get('https://election.ratopati.com/api/address/district?province_id=1', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('District API:', data.substring(0, 500));
  });
}).on('error', (err) => {
  console.error(err);
});
