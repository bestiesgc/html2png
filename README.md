# @besties/html2png

A wrapper for [satori](https://www.npmjs.com/package/satori) and [@resvg/resvg-wasm](https://www.npmjs.com/package/@resvg/resvg-wasm), adding support for using HTML strings rather than VDOM along with specifying classes for elements by inlining all CSS.

## Usage

```js
import html2png from '@besties/html2png'
import fs from 'node:fs'

const someFont = fs.readFileSync('./example.ttf')

fs.promises.writeFile(
	'test.png',
	await html2png(
		'<div class="main"><p>Hello world!</p></div>
		<style>
			.main {
				display: flex;
				justify-content: center;
				align-items: center;
				background-color: #1b171f;
				color: #ffffff;
				width: 100%;
				height: 100%;
				font-size: 4rem;
			}
		</style>',
		{
			width: 400,
			height: 200,
			fonts: [
				{
					name: 'Example',
					data: someFont,
					weight: 400,
					style: 'normal'
				}
			]
		}
	)
)
```
