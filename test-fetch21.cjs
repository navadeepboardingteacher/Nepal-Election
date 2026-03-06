const https = require('https');

https.get('https://election.ratopati.com/api/candidates?limit=200', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const parsed = JSON.parse(data);
    let hasVotes = false;
    for (const c of parsed.data) {
      for (const cand of c.candidates) {
        if (cand.vote && cand.vote !== "") {
          hasVotes = true;
          console.log(c.constituency_name, cand.name, cand.vote);
          break;
        }
      }
      if (hasVotes) break;
    }
    if (!hasVotes) console.log("No votes found in any candidate");
  });
}).on('error', (err) => {
  console.error(err);
});
