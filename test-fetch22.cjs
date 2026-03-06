const https = require('https');

https.get('https://election.ratopati.com/api/candidates?limit=200', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const parsed = JSON.parse(data);
    let withVotes = 0;
    for (const c of parsed.data) {
      let hasVotes = false;
      for (const cand of c.candidates) {
        if (cand.vote && cand.vote !== "") {
          hasVotes = true;
        }
      }
      if (hasVotes) withVotes++;
    }
    console.log("Constituencies with votes:", withVotes);
  });
}).on('error', (err) => {
  console.error(err);
});
