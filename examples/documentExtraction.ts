import "dotenv/config";
import { OpenAI } from "openai";
import { writeFileSync } from "fs";

const openai = new OpenAI({
  apiKey: process.env.INTERFAZE_API_KEY,
  baseURL: "https://api.interfaze.ai/v1",
});

const startTime = Date.now();

const response2 = await openai.chat.completions.create({
    model: "interfaze-beta",
    messages: [{
      role: "user",
      content: [
        { type: "text", text: "Extract the text from this PDF file" },
        {
          type: "file",
          file: {
            filename: "basic-link-1.pdf",
            file_data: "https://oaggeqpygpxuclokkhvh.supabase.co/storage/v1/object/sign/user-files/2f2d1809-9f8b-46b3-b995-b75440eecbe8/7B%20Applications%20of%20Differentiation%20Notes.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82OWExODk5OC05NTE2LTQ2NjItYTlhYS0zMjEyZTI2MjNlNjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ1c2VyLWZpbGVzLzJmMmQxODA5LTlmOGItNDZiMy1iOTk1LWI3NTQ0MGVlY2JlOC83QiBBcHBsaWNhdGlvbnMgb2YgRGlmZmVyZW50aWF0aW9uIE5vdGVzLnBkZiIsImlhdCI6MTc2MTc0NjA0MCwiZXhwIjoxNzYyMzUwODQwfQ.Yo7kn44K-9ai0K9rxVSHFPBXbXT5NJIDyVRYayTvKcA"
          }
        }
      ]
    }]
  });

const endTime = Date.now();
const timeTaken = (endTime - startTime) / 1000;

console.log(`\nTime taken: ${timeTaken.toFixed(2)} seconds`);
console.log("\nResponse:", response2.choices[0]?.message?.content);

// Save response to file
writeFileSync("response.json", JSON.stringify(response2, null, 2));
console.log("\nResponse saved to response.json");
