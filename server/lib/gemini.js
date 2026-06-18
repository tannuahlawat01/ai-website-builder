const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const SYSTEM_PROMPT = `You are an expert web developer and UI designer. When given a description, generate a single complete HTML file.

Requirements:
1. Fully self-contained — all CSS inside <style> tags, all JS inside <script> tags
2. Modern, beautiful, professional design
3. Responsive — works on mobile and desktop
4. Use Google Fonts via CDN link tag (allowed)
5. Realistic placeholder content that fits the website purpose
6. Smooth CSS animations and hover effects
7. Semantic HTML5 tags
8. Consistent color scheme throughout

CRITICAL: Return ONLY the raw HTML code. Start directly with <!DOCTYPE html>. 
No markdown, no code fences, no explanation, no backticks. Just pure HTML.`;

const generateWebsite = async (userPrompt) => {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Build this website: ${userPrompt}` }
    ],
    temperature: 0.7,
    max_tokens: 8192
  });

  let html = response.choices[0].message.content.trim();
  
  // Clean response — remove markdown code fences if added
  if (html.startsWith('```html')) html = html.slice(7);
  if (html.startsWith('```')) html = html.slice(3);
  if (html.endsWith('```')) html = html.slice(0, -3);
  html = html.trim();

  if (!html.toLowerCase().includes('<!doctype') && !html.toLowerCase().includes('<html')) {
    throw new Error('AI did not return valid HTML');
  }

  return html;
};

const refineWebsite = async (existingHTML, instruction) => {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'user',
        content: `You are an expert web developer. Here is an existing website HTML:\n\n${existingHTML.slice(0, 8000)}\n\nModify it according to this instruction: "${instruction}"\n\nMake ONLY the requested changes. Return the complete updated HTML starting with <!DOCTYPE html>. No explanations, no markdown, just pure HTML.`
      }
    ],
    temperature: 0.7,
    max_tokens: 8192
  });

  let html = response.choices[0].message.content.trim();
  if (html.startsWith('```html')) html = html.slice(7);
  if (html.startsWith('```')) html = html.slice(3);
  if (html.endsWith('```')) html = html.slice(0, -3);
  return html.trim();
};

module.exports = { generateWebsite, refineWebsite };