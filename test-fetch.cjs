const https = require('https');

https.get('https://election.ratopati.com/', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const apiUrls = data.match(/https?:\/\/[^"'\s]+api[^"'\s]*/gi);
    const jsonUrls = data.match(/https?:\/\/[^"'\s]+\.json/gi);
    console.log('API URLs:', apiUrls ? [...new Set(apiUrls)] : 'None found');
    console.log('JSON URLs:', jsonUrls ? [...new Set(jsonUrls)] : 'None found');
    
    // Also check for any script tags that might contain data
    const scriptData = data.match(/<script id="__NEXT_DATA__".*?>(.*?)<\/script>/s);
    if (scriptData) {
      console.log('Found Next.js data!');
      // console.log(scriptData[1].substring(0, 500));
    }
  });
}).on('error', (err) => {
  console.error(err);
});
