const https = require('https');

https.get('https://election.ratopati.com/api/candidates?province_id=1', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const parsed = JSON.parse(data);
    console.log("With province_id=1:", parsed.data.length);
  });
}).on('error', (err) => {
  console.error(err);
});

https.get('https://election.ratopati.com/api/candidates?district_id=1', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const parsed = JSON.parse(data);
    console.log("With district_id=1:", parsed.data.length);
  });
}).on('error', (err) => {
  console.error(err);
});
