// netlify/functions/chat.js

import Groq from "groq-sdk";

// ایجاد یک آرایه از کلیدهای API به صورت پویا از متغیرهای محیطی
const apiKeys = Object.keys(process.env)
  .filter(key => key.startsWith('GROQ_API_KEY_'))
  .map(key => process.env[key]);

if (apiKeys.length === 0) {
    console.error("No Groq API keys found in environment variables.");
    throw new Error("API keys not configured.");
}

// یک شمارنده برای انتخاب کلید به صورت گردشی
let currentKeyIndex = 0;

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
  }

  const { userMessage } = JSON.parse(event.body);
  let groqInstance;

  try {
    // انتخاب کلید API بعدی از آرایه
    const apiKey = apiKeys[currentKeyIndex];
    
    // ایجاد نمونه Groq با کلید انتخاب شده
    groqInstance = new Groq({ apiKey });

    // به روز رسانی شمارنده برای درخواست بعدی
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;

    const chatCompletion = await groqInstance.chat.completions.create({
      messages: [{ role: "user", content: userMessage }],
      model: "llama3-8b-8192", // می‌توانید مدل را تغییر دهید
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        response: chatCompletion.choices[0]?.message?.content || "An error occurred.",
      }),
    };
  } catch (error) {
    console.error("Error communicating with Groq API:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
