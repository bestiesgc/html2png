import { parse } from 'node-html-parser'
import { Resvg, initWasm } from '@resvg/resvg-wasm'
import fs from 'node:fs'
import satori from 'satori'
import { minify } from 'html-minifier'
import { fileURLToPath } from 'node:url'

async function getResolve() {
	if (import.meta.resolve) return import.meta.resolve
	const { resolve } = await import('import-meta-resolve')
	return (...arguments_) => fileURLToPath(resolve(...arguments_))
}

const resolve = await getResolve()

const minifyOptions = {
	collapseWhitespace: true
}

await initWasm(
	fs.readFileSync(
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

function styleStringToObject(style) {
	if (!style) return {}
	const rules = {}
	const keyPairs = style.split(';').filter(Boolean)
	for (const rule of keyPairs) {
		const [name, value] = rule.trim().split(':')
		const jsName = name
			.trim()
			.split('-')
			.map((element, index) => {
				if (index == 0) return element
				return element[0].toUpperCase() + element.slice(1)
			})
			.join('')
		rules[jsName] = value.trim()
	}
	return rules
}

function parseElement(element) {
	if (element.nodeType != 1) {
		return element.textContent
	}
	const result = {
		type: element.rawTagName,
		props: {
			...element.attributes,
			style: styleStringToObject(element.getAttribute('style'))
		}
	}
	if (element.childNodes.length > 0) {
		result.props.children = element.childNodes.map(element =>
			parseElement(element)
		)
	}
	return result
}

function parseCSS(css) {
	const ruleRegexp = /\s*([\d#*.:>A-Za-z-][\d\s#()*,.:>A-Za-z-]*)\s*{(.*?)}\s*/s
	const rules = []
	while (css.length > 0) {
		const regexpExec = ruleRegexp.exec(css)
		const selector = regexpExec[1].trim()
		let properties = regexpExec[2].trim()
		if (properties.endsWith(';')) properties = properties.slice(0, -1)
		rules.push([selector, properties])
		css = css.replace(ruleRegexp, '').trim()
	}
	return Object.fromEntries(rules)
}

export function renderHtml(html, css) {
	const parsedCss = parseCSS(css)
	const root = parse(minify(html, minifyOptions))
	for (const key of Object.keys(parsedCss)) {
		const classRules = parsedCss[key]
		for (const element of root.querySelectorAll(key)) {
			let existingStyle = element.getAttribute('style')?.trim() ?? ''
			if (existingStyle != '' && !existingStyle.endsWith(';')) {
				existingStyle += ';'
			}
			element.setAttribute(
				'style',
				(existingStyle + classRules.trim()).replaceAll(/\s+/gm, ' ')
			)
		}
	}
	const elements = root.querySelectorAll('*')
	for (const element of elements) {
		element.removeAttribute('class')
	}
	return root
}

export default async function render(html, css, options) {
	options = options ?? {}
	if (!options.width) options.width = 1200
	if (!options.height) options.height = 600
	const root = renderHtml(html, css)
	const htmlObjects = parseElement(root.firstChild)
	const svg = await satori(htmlObjects, {
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
