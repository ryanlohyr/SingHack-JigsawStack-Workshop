import { interfaze } from '../models';

const startTime = Date.now();
const response = await interfaze.chat.completions.create({
  model: 'interfaze-beta',
  messages: [
    {
      role: 'user',
      content:
        'Run this code:\n\ndef factorial(n):\n    if n == 0 or n == 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(5))',
    },
  ],
});

const endTime = Date.now();
const timeTaken = (endTime - startTime) / 1000;

console.log(`\nTime taken: ${timeTaken.toFixed(2)} seconds`);
console.log("\nResponse:", JSON.stringify(response, null, 2));
console.log(response.choices[0].message.content);

// Response: "120"
