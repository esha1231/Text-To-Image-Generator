export default async function handler(req, res) {
    const { data, seed } = req.body;
    const token = process.env.API_TOKEN;
  
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
      const result = await response.blob();
      res.setHeader("Content-Type", "image/png");
      res.send(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  