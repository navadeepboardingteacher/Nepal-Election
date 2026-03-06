const https = require('https');

https.get('https://election.ratopati.com/api/result', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(res.statusCode);
    console.log(data.substring(0, 500));
  });
}).on('error', (err) => {
  console.error(err);
});
