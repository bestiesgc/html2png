import {
	parse,
	html as __html,
	walkSync,
	ELEMENT_NODE,
	DOCUMENT_NODE,
	TEXT_NODE
} from 'ultrahtml'
import { decode as decodeEntities } from 'html-entities'
import inlineCSS from 'ultrahtml/transformers/inline'

const inliner = inlineCSS({ useObjectSyntax: true })
const camelize = ident =>
	ident.replaceAll(/-([a-z])/g, (_, char) => char.toUpperCase())

export function html(templates, ...expressions) {
	const result = __html.call(undefined, templates, ...expressions)
	const document = parse(result.value.trim())
	inliner(document)

	const nodeMap = new WeakMap()
	const root = {
		type: 'div',
		props: {
			style: {
				display: 'flex',
				flexDirection: 'column',
				width: '100%',
				height: '100%'
			},
			children: []
		}
	}
	walkSync(document, (node, parent, index) => {
		let newNode = {}
		switch (node.type) {
			case DOCUMENT_NODE: {
				nodeMap.set(node, root)
				break
			}
			case ELEMENT_NODE: {
				newNode.type = node.name
				const { style, ...properties } = node.attributes
				if (typeof style === 'object') {
					properties['style'] = {}
					for (const [decl, value] of Object.entries(style)) {
						properties['style'][camelize(decl)] = value
					}
				}
				properties.children = []
				Object.assign(newNode, { props: properties })
				nodeMap.set(node, newNode)
				if (parent) {
					const newParent = nodeMap.get(parent)
					newParent.props.children[index] = newNode
				}
				break
			}
			case TEXT_NODE: {
				newNode = decodeEntities(node.value.trim())
				if (newNode && parent) {
					const newParent = nodeMap.get(parent)
					if (parent.children.length === 1) {
						newParent.props.children = newNode
					} else {
						newParent.props.children[index] = newNode
					}
				}
				break
			}
		}
	})

	return root
}
