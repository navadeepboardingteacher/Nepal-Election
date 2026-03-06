const https = require('https');

https.get('https://election.ratopati.com/api/candidates', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(data.substring(0, 1000));
  });
}).on('error', (err) => {
  console.error(err);
});
