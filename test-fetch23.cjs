const https = require('https');

https.get('https://election.ratopati.com/api/candidates?limit=200', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const parsed = JSON.parse(data);
    let winners = 0;
    for (const c of parsed.data) {
      for (const cand of c.candidates) {
        if (cand.is_winner) {
          winners++;
        }
      }
    }
    console.log("Winners:", winners);
  });
}).on('error', (err) => {
  console.error(err);
});
