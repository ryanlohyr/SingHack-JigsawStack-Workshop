import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { interfaze } from '../models';

const founderSchema = z.object({
  name: z.string().describe('The full name of the founder'),
});

const response = await interfaze.chat.completions.create({
  model: 'interfaze-beta',
  messages: [
    {
      role: 'user',
      content: 'Who is the founder of JigsawStack?',
    },
  ],
  response_format: zodResponseFormat(founderSchema, 'founder_schema'),
});

console.log(response.choices[0].message.content);
