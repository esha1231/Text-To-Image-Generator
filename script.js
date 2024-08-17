const button = document.getElementById("btn");
const input = document.getElementById("input");
const imageContainer = document.getElementById("imageContainer");

async function generateImages() {
  imageContainer.innerHTML = ""; // Clear previous images
  const prompt = input.value;

  if (!prompt) return; // Exit if no prompt is provided

  button.textContent = "Generating...";
  button.disabled = true;

  const numImages = 3; // Number of images to generate
  const imagePromises = [];

  // Loop to generate multiple images
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
        throw new Error('Network response was not ok');
      }
      return response.blob(); // Convert response to blob
    })
    .then(blob => {
      const objectUrl = URL.createObjectURL(blob); // Create a URL for the blob
      console.log(`Generated image URL: ${objectUrl}`); // Log the URL for debugging
      const wrapper = document.createElement("div");
      wrapper.className = "imageWrapper";

      const img = document.createElement("img");
      img.src = objectUrl; // Set the image source to the blob URL
      img.alt = `Generated image ${i + 1}`;
      img.onload = () => URL.revokeObjectURL(objectUrl); // Clean up object URL after image loads

      const downloadBtn = document.createElement("button");
      downloadBtn.className = "downloadBtn";
      downloadBtn.textContent = "Download";
      downloadBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent event bubbling
        downloadImage(blob, `generated_image_${i + 1}.png`); // Trigger download
      });

      wrapper.appendChild(img); // Append image to wrapper
      wrapper.appendChild(downloadBtn); // Append download button to wrapper
      imageContainer.appendChild(wrapper); // Append wrapper to image container
    })
    .catch(error => {
      console.error('Error generating image:', error.message); // Log any errors
    });

    imagePromises.push(promise); // Store the promise for later use
  }

  try {
    await Promise.all(imagePromises); // Wait for all images to be generated
  } catch (error) {
    console.error('Error in promises:', error.message); // Log any errors in promises
  } finally {
    button.textContent = "Generate"; // Reset button text
    button.disabled = false; // Enable button
    input.value = ""; // Clear input field
  }
}

// Function to download the generated image
function downloadImage(blob, fileName) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob); // Create a URL for the blob
  link.download = fileName; // Set the download file name
  document.body.appendChild(link); // Append link to the body (required for Firefox)
  link.click(); // Trigger the download
  document.body.removeChild(link); // Remove link from the body
}

// Event listener for the generate button
button.addEventListener("click", (event) => {
  event.preventDefault(); // Prevent default action
  generateImages(); // Call the function to generate images
});