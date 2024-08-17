// File: api/generate.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { prompt, seed } = req.body;
  const token = process.env.API_TOKEN;

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/ZB-Tech/Text-to-Image", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { seed: seed },
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.buffer();
    res.setHeader('Content-Type', 'image/png');
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
}
