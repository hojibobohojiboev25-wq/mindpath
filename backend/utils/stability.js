const axios = require('axios');
const fs = require('fs');
const path = require('path');

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const STABILITY_API_URL = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';

// Generate mind map image using Stability AI
async function generateMindMap(responses, personalityAnalysis) {
  try {
    const prompt = createMindMapPrompt(responses, personalityAnalysis);

    const response = await axios.post(
      STABILITY_API_URL,
      {
        text_prompts: [
          {
            text: prompt,
            weight: 1
          }
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
        style_preset: 'enhance'
      },
      {
        headers: {
          'Authorization': `Bearer ${STABILITY_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        responseType: 'arraybuffer',
        timeout: 60000 // 60 seconds timeout
      }
    );

    // Save the image
    const imageBuffer = Buffer.from(response.data);
    const filename = `mindmap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`;
    const filepath = path.join(__dirname, '../public/images', filename);

    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Save image to file
    fs.writeFileSync(filepath, imageBuffer);

    // Return URL to the image (in production, you'd upload to cloud storage)
    const imageUrl = `/images/${filename}`;

    return imageUrl;

  } catch (error) {
    console.error('Stability AI API error:', error.response?.data || error.message);
    throw new Error('Failed to generate mind map image');
  }
}

// Create prompt for mind map image generation
function createMindMapPrompt(responses, personalityAnalysis) {
  let prompt = 'Create a beautiful, colorful mind map visualization showing personality analysis. ';

  // Add key elements from responses
  if (responses.values && Array.isArray(responses.values)) {
    prompt += `Core values: ${responses.values.join(', ')}. `;
  }

  if (responses.personality && Array.isArray(responses.personality)) {
    prompt += `Personality traits: ${responses.personality.join(', ')}. `;
  }

  if (responses.strengths) {
    prompt += `Strengths: ${responses.strengths}. `;
  }

  if (responses.goals) {
    prompt += `Goals: ${responses.goals}. `;
  }

  // Add artistic style
  prompt += 'Style: clean, modern, infographic, mind map with central node connected to various branches, colorful, professional, inspirational, digital art, high quality, detailed.';

  return prompt;
}

module.exports = {
  generateMindMap
};