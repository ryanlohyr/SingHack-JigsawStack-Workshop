import 'dotenv/config';
import { writeFileSync } from 'fs';
import { interfaze } from '../models';

const startTime = Date.now();

const response2 = await interfaze.chat.completions.create({
  model: 'interfaze-beta',
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Extract the text from this PDF file' },
        {
          type: 'file',
          file: {
            filename: 'basic-link-1.pdf',
            file_data:
              'https://www.antennahouse.com/hubfs/xsl-fo-sample/pdf/basic-link-1.pdf',
          },
        },
      ],
    },
  ],
});

const endTime = Date.now();
const timeTaken = (endTime - startTime) / 1000;

console.log(`\nTime taken: ${timeTaken.toFixed(2)} seconds`);
console.log('\nResponse:', response2.choices[0]?.message?.content);

// Save response to file
writeFileSync('response.json', JSON.stringify(response2, null, 2));
console.log('\nResponse saved to response.json');
