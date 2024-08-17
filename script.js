// script.js

const button = document.getElementById("btn");
const imageContainer = document.getElementById("imageContainer");
const input = document.getElementById("input"); // Added this line to define input

async function query(data, seed) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data, seed }),
  });
  const result = await response.blob();
  return result;
}

async function generateImages() {
  imageContainer.innerHTML = "";
  const prompt = input.value;

  if (!prompt) return;

  // Show "Generating..." message
  button.textContent = "Generating...";
  button.disabled = true;

  const imagePromises = [];
  const numImages = 6;

  for (let i = 0; i < numImages; i++) {
    const seed = Math.floor(Math.random() * 1000000);
    const promise = query(prompt, seed).then((blob) => {
      return new Promise((resolve) => {
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

        // Append elements to the wrapper and container
        wrapper.appendChild(img);
        wrapper.appendChild(downloadBtn);
        imageContainer.appendChild(wrapper);

        // Resolve the promise after the image is loaded
        img.onload = () => resolve();
      });
    });

    imagePromises.push(promise);
  }

  // Wait for all images to be loaded
  try {
    await Promise.all(imagePromises);
  } catch (error) {
    console.error(error.message);
  } finally {
    // Restore button state after images are loaded
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
  event.preventDefault(); // Prevent form submission or default action
  generateImages();
});
