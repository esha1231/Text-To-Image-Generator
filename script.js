const button = document.getElementById("btn");
const input = document.getElementById("input");
const imageContainer = document.getElementById("imageContainer");

async function generateImages() {
    imageContainer.innerHTML = "";
    const prompt = input.value;

    if (!prompt) return;

    button.textContent = "Generating...";
    button.disabled = true;

    const numImages = 3;
    const imagePromises = [];

    for (let i = 0; i < numImages; i++) {
        const promise = fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt, seed: Math.floor(Math.random() * 1000000) }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Image generation failed with status ${response.status}`);
            }
            return response.blob();
        })
        .then(blob => {
            const objectUrl = URL.createObjectURL(blob);
            console.log(`Generated Image URL: ${objectUrl}`);

            const wrapper = document.createElement("div");
            wrapper.className = "imageWrapper";

            const img = document.createElement("img");
            img.src = objectUrl;
            img.alt = `Generated image ${i + 1}`;
            img.onload = () => {
                console.log(`Image ${i + 1} loaded successfully`);
                URL.revokeObjectURL(objectUrl); // Clean up object URL after image loads
            };

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
        .catch(error => {
            console.error(`Error generating image ${i + 1}:`, error);
        });

        imagePromises.push(promise);
    }

    try {
        await Promise.all(imagePromises);
    } catch (error) {
        console.error("Error in image generation:", error);
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
