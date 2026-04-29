const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const keyLine = env.split('\n').find(line => line.startsWith('GOOGLE_GEMINI_API_KEY='));
const apiKey = keyLine ? keyLine.split('=')[1].trim() : null;

if (!apiKey) {
  console.error("No API key found in .env.local");
  process.exit(1);
}

async function test() {
  console.log("Testing with key:", apiKey.substring(0, 5) + "...");
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: "Hello, world!" }] }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, response.statusText);
      console.error(errorText);
    } else {
      const data = await response.json();
      console.log("Success! Response:", JSON.stringify(data, null, 2).substring(0, 200) + "...");
    }
  } catch (e) {
    console.error("Fetch Error:", e);
  }
}

test();
