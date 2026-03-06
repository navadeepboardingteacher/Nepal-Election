const https = require('https');

https.get('https://election.ratopati.com/assets/js/main.js', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const apiUrls = data.match(/https?:\/\/[^"'\s]+/gi);
    console.log('URLs in main.js:', apiUrls ? [...new Set(apiUrls)] : 'None found');
  });
}).on('error', (err) => {
  console.error(err);
});
