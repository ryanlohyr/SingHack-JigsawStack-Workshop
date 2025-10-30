import { interfaze } from '../models';

const response = await interfaze.chat.completions.create({
  model: 'interfaze-beta',
  messages: [
    {
      role: 'user',
      content:
        'Explain why renewable energy is important for combating climate change. Consider economic, environmental, and social factors.',
    },
  ],
  reasoning_effort: 'high',
});

console.log(JSON.stringify(response, null, 2));