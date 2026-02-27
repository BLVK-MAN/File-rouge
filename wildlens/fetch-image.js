const https = require('https');
const fs = require('fs');

https.get('https://upload.wikimedia.org/wikipedia/commons/4/4c/Tiger_in_Ranthambhore.jpg', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
}, (res) => {
    if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream('test-tiger.jpg'));
    } else {
        console.error('Failed to download', res.statusCode);
    }
});
