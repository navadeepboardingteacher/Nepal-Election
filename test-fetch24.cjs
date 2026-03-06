const https = require('https');

https.get('https://election.ratopati.com/api/candidates?limit=1', {
  headers: {
    'Origin': 'http://localhost:3000'
  }
}, (res) => {
  console.log(res.headers);
}).on('error', (err) => {
  console.error(err);
});
