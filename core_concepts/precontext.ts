import { interfaze } from '../models';

const response = await interfaze.chat.completions.create({
	model: "interfaze-beta",
	messages: [
		{
			role: "user",
			content: [
				{ type: "text", text: "Extract total price from this receipt" },
				{
					type: "image_url",
					image_url: {
						url: "https://jigsawstack.com/preview/vocr-example.jpg",
					},
				},
			],
		},
	],
});

//@ts-expect-error precontext is not typed
const precontext = response.precontext;
console.log("OCR Results:", precontext[0]?.result);
console.log("Process used:", precontext[0]?.name);

