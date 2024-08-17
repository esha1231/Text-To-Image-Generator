const fetch = require('node-fetch');

const query = async (data, seed) => {
  const token = process.env.API_TOKEN;

  const response = await fetch(
    'https://api-inference.huggingface.co/models/ZB-Tech/Text-to-Image',
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        inputs: data,
        parameters: { seed: seed },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }

  const result = await response.blob();
  return result;
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Bad Request: Missing prompt' });
  }

  try {
    const imagePromises = [];
    const numImages = 6;

    for (let i = 0; i < numImages; i++) {
      const seed = Math.floor(Math.random() * 1000000);
      imagePromises.push(query(prompt, seed));
    }

    const images = await Promise.all(imagePromises);
    const urls = images.map((blob) => URL.createObjectURL(blob));

    res.status(200).json({ images: urls });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
