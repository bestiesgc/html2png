import { parse } from 'node-html-parser'
import { Resvg, initWasm } from '@resvg/resvg-wasm'
import fs from 'node:fs'
import satori from 'satori'

await initWasm(fs.readFileSync('node_modules/@resvg/resvg-wasm/index_bg.wasm'))

function typedarrayToBuffer(arr) {
	return ArrayBuffer.isView(arr)
		? // To avoid a copy, use the typed array's underlying ArrayBuffer to back
		  // new Buffer, respecting the "view", i.e. byteOffset and byteLength
		  Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength)
		: // Pass through all other types to `Buffer.from`
		  Buffer.from(arr)
}

function styleStringToObject(style) {
	return Object.fromEntries(
		style
			.split(';')
			.filter(string => string)
			.map(rule => {
				const [name, value] = rule.trim().split(':')
				const jsName = name
					.split('-')
					.map((e, i) => {
						if (i == 0) return e
						return e[0].toUpperCase() + e.slice(1)
					})
					.join('')
				return [jsName.trim(), value.trim()]
			})
	)
}

function parseElement(element) {
	if (element.nodeType != 1) {
		return element._rawText
	}
	let result = {
		type: element.rawTagName,
		props: {
			...element.attributes,
			style: styleStringToObject(element.getAttribute('style'))
		}
	}
	if (element.childNodes.length > 0) {
		result.props.children = element.childNodes.map(parseElement)
	}
	return result
}

function parseCSS(css) {
	const ruleRegexp = /\s*((?:[\.#]?[a-zA-Z0-:9 >]+|\*))\s*\{(.*?)\}\s*/s
	const rules = []
	while (css.length > 0) {
		const selector = ruleRegexp.exec(css)[1].trim()
		let properties = ruleRegexp.exec(css)[2].trim()
		if (properties.endsWith(';')) properties = properties.slice(0, -1)
		rules.push([selector, properties])
		css = css.replace(ruleRegexp, '').trim()
	}
	return Object.fromEntries(rules)
}

export default async function render(
	html,
	css,
	options
) {
	options = options ?? {}
	if (!options.width) options.width = 1200
	if (!options.height) options.height = 600
	const parsedCss = parseCSS(css)
	const root = parse(html)
	for (let key of Object.keys(parsedCss)) {
		const classRules = parsedCss[key]
		for (let elem of root.querySelectorAll(key)) {
			elem.setAttribute(
				'style',
				(elem.getAttribute('style') ?? '') + classRules.trim()
			)
		}
	}
	const htmlObjects = parseElement(root.firstChild)
	const svg = await satori(htmlObjects, {
		width: options.width,
		height: options.height,
		fonts: options.fonts
	})
	const resvgJs = new Resvg(svg)
	const pngBuffer = resvgJs.render().asPng()
	return typedarrayToBuffer(pngBuffer)
}
