const https = require('https');

https.get('https://election.ratopati.com/', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const scriptData = data.match(/<script id="__NEXT_DATA__".*?>(.*?)<\/script>/s);
    if (scriptData) {
      const parsed = JSON.parse(scriptData[1]);
      console.log(JSON.stringify(parsed.props.pageProps, null, 2).substring(0, 1000));
    } else {
      console.log('No NEXT_DATA found');
      // Maybe it's a different framework
      console.log(data.substring(0, 1000));
    }
  });
}).on('error', (err) => {
  console.error(err);
});
