// script.js
const button = document.getElementById("btn");
const imageContainer = document.getElementById("imageContainer");
const input = document.getElementById("input");

async function query(prompt, seed) {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/ZB-Tech/Text-to-Image",
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: { seed: seed },
        }),
      }
    );

    if (!response.ok) throw new Error("Failed to generate image");

    const result = await response.blob();
    return result;
  } catch (error) {
    console.error("Error in query:", error);
    throw error;
  }
}

async function generateImages() {
  imageContainer.innerHTML = "";
  const prompt = input.value;

  if (!prompt) return;

  button.textContent = "Generating...";
  button.disabled = true;

  const imagePromises = [];
  const numImages = 3;

  for (let i = 0; i < numImages; i++) {
    const seed = Math.floor(Math.random() * 1000000);
    imagePromises.push(
      query(prompt, seed).then((blob) => {
        const objectUrl = URL.createObjectURL(blob);

        const wrapper = document.createElement("div");
        wrapper.className = "imageWrapper";

        const img = document.createElement("img");
        img.src = objectUrl;
        img.alt = `Generated image ${i + 1}`;

        const downloadBtn = document.createElement("button");
        downloadBtn.className = "downloadBtn";
        downloadBtn.textContent = "Download";
        downloadBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          downloadImage(blob, `generated_image_${i + 1}.png`);
        });

        wrapper.appendChild(img);
        wrapper.appendChild(downloadBtn);
        imageContainer.appendChild(wrapper);
      })
    );
  }

  try {
    await Promise.all(imagePromises);
  } catch (error) {
    console.error("Error in generating images:", error);
  } finally {
    button.textContent = "Generate";
    button.disabled = false;
    input.value = "";
  }
}

function downloadImage(blob, fileName) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

button.addEventListener("click", (event) => {
  event.preventDefault();
  generateImages();
});
