export default async function handler(req, res) {
    const { API_TOKEN } = process.env;
  
    if (!req.body.prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
  
    const prompt = req.body.prompt;
    const numImages = 6;
    const imagePromises = [];
  
    try {
      const fetch = (await import('node-fetch')).default;
  
      for (let i = 0; i < numImages; i++) {
        const seed = Math.floor(Math.random() * 1000000);
  
        const response = await fetch('https://api-inference.huggingface.co/models/ZB-Tech/Text-to-Image', {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            inputs: prompt,
            parameters: { seed: seed },
          }),
        });
  
        if (!response.ok) {
          throw new Error(`Failed to fetch image ${i + 1}`);
        }
  
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
  
        imagePromises.push(objectUrl);
      }
  
      const images = await Promise.all(imagePromises);
  
      res.status(200).json({ images });
    } catch (error) {
      console.error('Error generating images:', error);
      res.status(500).json({ error: 'Failed to generate images' });
    }
  }
  