# @besties/html2png

```js
import html2png from '@besties/html2png'

const figtreeRegular = fs.readFileSync('./assets/fonts/Figtree-Regular.woff')
const figtreeMedium = fs.readFileSync('./assets/fonts/Figtree-Medium.woff')
const figtreeExtraBold = fs.readFileSync(
	'./assets/fonts/Figtree-ExtraBold.woff'
)

fs.promises.writeFile(
	'test.png',
	await html2png(
		`<div class="main">
			<div class="contents">
				<div class="info">
					<p style="font-size: 20px; color: #9A8FA7;">@besties/html2png</p>
					<p style="font-weight: 800; font-size: 40px;">wow! a very cool example!</p>
				</div>
				<div class="graphics">
					<img width="120" height="120" src="https://git.gay/avatars/d2d033ed83e7ef19a0f279e6cc9e32c3f3563504ec2aa6af1893f376b2074ffb?size=120"></img>
				</div>
			</div>
		</div>`,
		`p {
			margin: 0;
		}

		.main {
			color: #ffffff;
			display: flex;
			justify-content: center;
			align-items: center;
			background-color: #1B171F;
			width: 1200px;
			height: 600px;
		}

		.contents {
			display: flex;
		}

		.info {
			display: flex;
			flex-direction: column;
			justify-content: center;
			width: 800px;
			gap: 10px;
		}

		.graphics {
			display: flex;
			justify-content: flex-end;
			align-items: flex-start;
			width: 240px;
		}

		.graphics > img {
			border-radius: 100%;
			width: 120px;
			height: 120px;
		}`,
		{
			fonts: [
				{
					name: 'Figtree',
					data: figtreeRegular,
					weight: 400,
					style: 'normal'
				},
				{
					name: 'Figtree',
					data: figtreeMedium,
					weight: 500,
					style: 'normal'
				},
				{
					name: 'Figtree',
					data: figtreeExtraBold,
					weight: 800,
					style: 'normal'
				}
			]
		}
	)
)
```

made with ❤️ by besties
