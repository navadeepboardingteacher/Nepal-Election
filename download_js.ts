import fs from 'fs';
import https from 'https';

const url = 'https://election.psbnepal.gov.np/main.1d5ea4c6cac5c8a0.js';
const file = fs.createWriteStream('main.js');

https.get(url, (response) => {
  response.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Download completed');
  });
});
