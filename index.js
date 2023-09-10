import { Resvg, initWasm } from '@resvg/resvg-wasm'
import fs from 'node:fs'
import satori from 'satori'
import { html as satoriHTML } from './lib/satori-html/index.js'
import { fileURLToPath } from 'node:url'

async function getResolve() {
	if (import.meta.resolve) return import.meta.resolve
	const { resolve } = await import('import-meta-resolve')
	return (...arguments_) => fileURLToPath(resolve(...arguments_))
}

const resolve = await getResolve()

await initWasm(
	await fs.promises.readFile(
		await resolve('@resvg/resvg-wasm/index_bg.wasm', import.meta.url)
	)
)

function typedarrayToBuffer(array) {
	return ArrayBuffer.isView(array)
		? // To avoid a copy, use the typed array's underlying ArrayBuffer to back
		  // new Buffer, respecting the "view", i.e. byteOffset and byteLength
		  Buffer.from(array.buffer, array.byteOffset, array.byteLength)
		: // Pass through all other types to `Buffer.from`
		  Buffer.from(array)
}

export async function renderHtml(html) {
	return html
}

export default async function render(html, options) {
	options = options ?? {}
	if (!options.width) options.width = 1200
	if (!options.height) options.height = 600
	const html_ = satoriHTML(html)
	const svg = await satori(html_, {
		width: options.width,
		height: options.height,
		fonts: options.fonts
	})
	if (options.format && options.format == 'svg') {
		// assuming the width / height is on the <svg>,
		// remove that, cause we already have the viewBox anyways
		return svg.replace(
			`width="${options.width}" height="${options.height}"`,
			''
		)
	}
	const resvgJs = new Resvg(svg)
	const pngBuffer = resvgJs.render().asPng()
	return typedarrayToBuffer(pngBuffer)
}
