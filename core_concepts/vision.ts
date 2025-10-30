import { interfaze } from '../models';


const response = await interfaze.chat.completions.create({
	model: "interfaze-beta",
	messages: [
		{
			role: "user",
			content: [
				{ type: "text", text: "Extract total price and tax" },
				{
					type: "image_url",
					image_url: {
						url: "https://media.istockphoto.com/id/1420767944/vector/register-sale-receipt-isolated-on-white-background-cash-receipt-printed.jpg?s=612x612&w=0&k=20&c=eV7CDJK0DZgKo7KVlGTDJeVMN_2xybqIPvt1ATl_kkM=",
					},
				},
			],
		},
	],
});

console.log(response.choices[0].message.content);
