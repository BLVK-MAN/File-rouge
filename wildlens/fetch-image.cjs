const https = require('https');
const fs = require('fs');

https.get('https://upload.wikimedia.org/wikipedia/commons/3/3f/Walking_tiger_female.jpg', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
}, (res) => {
    if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream('test-tiger.jpg'));
    } else {
        console.error('Failed to download', res.statusCode);
    }
});
