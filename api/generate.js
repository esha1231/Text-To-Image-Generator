// api/generate.js

async function fetchWithTimeout(url, options, timeout = 10000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(url, {
        ...options,
        signal: controller.signal
    });
    clearTimeout(id);
    return response;
}

export default async function handler(req, res) {
    const { data, seed } = req.body;
    const token = process.env.API_TOKEN;

    try {
        console.log("Requesting image generation with prompt:", data, "and seed:", seed);
        const response = await fetchWithTimeout(
            "https://api-inference.huggingface.co/models/ZB-Tech/Text-to-Image",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ inputs: data, parameters: { seed: seed } }),
            },
            15000 // 15 seconds timeout
        );

        console.log("Received response with status:", response.status);

        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
        }

        const result = await response.blob();
        res.setHeader("Content-Type", "image/png");
        res.send(result);
    } catch (error) {
        console.error("Error during image generation:", error.message);
        res.status(500).json({ error: error.message });
    }
}
