const https = require('https');
const fs = require('fs');

// Read API key from .env
const envFile = fs.readFileSync('.env', 'utf8');
const apiKeyMatch = envFile.match(/VITE_GEMINI_API_KEY=(.*)/);

if (!apiKeyMatch) {
    console.error("API Key not found in .env");
    process.exit(1);
}

const apiKey = apiKeyMatch[1].trim();
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.models) {
                const names = json.models.map(m => m.name);
                fs.writeFileSync('available-models.txt', JSON.stringify(names, null, 2));
            } else {
                console.log("Error or no models found: ", json);
            }
        } catch (e) {
            console.error("Parse error", e);
        }
    });
}).on('error', err => {
    console.error("Request error", err);
});
