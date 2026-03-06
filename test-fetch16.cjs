const https = require('https');

https.get('https://election.ratopati.com/result', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(res.statusCode);
    // console.log(data.substring(0, 1000));
    const matches = data.match(/<script.*?>(.*?)<\/script>/g);
    if (matches) {
      matches.forEach(m => {
        if (m.includes('window.') || m.includes('var ')) {
          console.log(m.substring(0, 200));
        }
      });
    }
  });
}).on('error', (err) => {
  console.error(err);
});
