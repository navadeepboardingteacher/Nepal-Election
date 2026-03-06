const https = require('https');

https.get('https://election.ratopati.com/', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const apiUrls = data.match(/https?:\/\/[^"'\s]+/gi);
    const uniqueUrls = [...new Set(apiUrls)].filter(url => url.includes('api') || url.includes('json') || url.includes('election.ratopati.com'));
    console.log(uniqueUrls.join('\n'));
  });
}).on('error', (err) => {
  console.error(err);
});
