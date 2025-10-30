import { interfaze, openai } from '../models';

const response = await interfaze.chat.completions.create({
  model: 'interfaze-beta',
  messages: [{ role: 'user', content: 'Can you tell me apple current stock price?' }],
});

// Interfaze will be able to give an accurate answer as it has access to the web.
console.log(response.choices[0].message.content);

const response2 = await openai.responses.create({
    model: "gpt-5",
    input: "Can you tell me apple current stock price?"
});

// GPT will not be able to give an accurate answer as it does not have access to the web.
console.log(response2.output_text);