const https = require('https');

const paths = [
  '/api/result',
  '/api/candidates',
  '/api/parties',
  '/api/summary',
  '/api/home'
];

paths.forEach(p => {
  https.get(`https://election.ratopati.com${p}`, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log(`--- ${p} ---`);
      console.log(res.statusCode);
      console.log(data.substring(0, 100));
    });
  }).on('error', (err) => {
    console.error(err);
  });
});
