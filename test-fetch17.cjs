const https = require('https');

https.get('https://election.ratopati.com/result', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const fs = require('fs');
    fs.writeFileSync('result.html', data);
    console.log('Saved to result.html');
  });
}).on('error', (err) => {
  console.error(err);
});
