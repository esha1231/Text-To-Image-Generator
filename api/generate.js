// api/generate.js (Vercel Serverless Function)

export default async function handler(req, res) {
    const { data, seed } = req.body;
    const token = process.env.API_TOKEN;
  
    if (!token) {
      return res.status(500).json({ error: "API_TOKEN is not defined" });
    }
  
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/ZB-Tech/Text-to-Image",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ inputs: data, parameters: { seed: seed } }),
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API request failed: ${errorText}`);
        return res.status(response.status).json({ error: errorText });
      }
  
      const result = await response.blob();
      res.setHeader("Content-Type", "image/png");
      res.send(result);
    } catch (error) {
      console.error(`Error occurred: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }
  