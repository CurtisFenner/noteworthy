import { Schema, Node as ProsemirrorNode } from "prosemirror-model";

export const journalSchema = new Schema({
	nodes: {
		doc: {
			content: "(cell|block)+"
		},

		journal_entry: {
			group: "cell",
			content: "block+",
			toDOM() { return ["div", { class: "journal-entry" }, 0] },
			parseDOM: [{ tag: "div.journal-entry" }]
		},

		paragraph: {
			content: "inline*",
			group: "block",
			parseDOM: [{ tag: "p" }],
			toDOM() { return ["p", 0] }
		},

		blockquote: {
			content: "block+",
			group: "block",
			parseDOM: [{ tag: "blockquote" }],
			toDOM() { return ["blockquote", 0] }
		},

		horizontal_rule: {
			group: "block",
			parseDOM: [{ tag: "hr" }],
			toDOM() { return ["div", ["hr"]] }
		},

		heading: {
			attrs: { level: { default: 1 } },
			content: "(text | image)*",
			group: "block",
			defining: true,
			parseDOM: [{ tag: "h1", attrs: { level: 1 } },
			{ tag: "h2", attrs: { level: 2 } },
			{ tag: "h3", attrs: { level: 3 } },
			{ tag: "h4", attrs: { level: 4 } },
			{ tag: "h5", attrs: { level: 5 } },
			{ tag: "h6", attrs: { level: 6 } }],
			toDOM(node) { return ["h" + node.attrs.level, 0] }
		},

		code_block: {
			content: "text*",
			group: "block",
			code: true,
			defining: true,
			marks: "",
			attrs: { params: { default: "" } },
			parseDOM: [{
				tag: "pre", preserveWhitespace: "full", getAttrs: node => (
					{ params: (node as HTMLElement).getAttribute("data-params") || "" }
				)
			}],
			toDOM(node) {
				return ["pre", {
					...(node.attrs.params && { "data-params": node.attrs.params })
				}, ["code", 0]]
			}
		},

		ordered_list: {
			content: "list_item+",
			group: "block",
			attrs: { order: { default: 1 }, tight: { default: false } },
			parseDOM: [{
				tag: "ol", getAttrs(dom) {
					let domElt: HTMLElement = (dom as HTMLElement);

					let start: number = 1;
					let startAttr: string | null;
					if (startAttr = domElt.getAttribute("start")) {
						start = +startAttr;
					}

					return {
						order: start,
						tight: domElt.hasAttribute("data-tight")
					}
				}
			}],
			toDOM(node) {
				return ["ol", {
					...(node.attrs.order == 1 && { start: node.attrs.order }),
					...(node.attrs.tight && { "data-tight": node.attrs.tight })
				}, 0]
			}
		},

		bullet_list: {
			content: "list_item+",
			group: "block",
			attrs: { tight: { default: false } },
			parseDOM: [{
				tag: "ul", getAttrs: dom => ({
					tight: (dom as HTMLElement).hasAttribute("data-tight")
				})
			}],
			toDOM(node) {
				return ["ol", {
					...(node.attrs.tight && { "data-tight": node.attrs.tight })
				}, 0]
			}
		},

		list_item: {
			content: "paragraph block*",
			defining: true,
			parseDOM: [{ tag: "li" }],
			toDOM() { return ["li", 0] }
		},

		text: {
			group: "inline"
		},

		image: {
			inline: true,
			attrs: {
				src: {},
				alt: { default: null },
				title: { default: null }
			},
			group: "inline",
			draggable: true,
			parseDOM: [{
				tag: "img[src]", getAttrs(dom) {
					return {
						src: (dom as HTMLElement).getAttribute("src"),
						title: (dom as HTMLElement).getAttribute("title"),
						alt: (dom as HTMLElement).getAttribute("alt")
					}
				}
			}],
			toDOM(node) { return ["img", node.attrs] }
		},

		hard_break: {
			inline: true,
			group: "inline",
			selectable: false,
			parseDOM: [{ tag: "br" }],
			toDOM() { return ["br"] }
		},

		math_inline: {
			group: "inline",
			content: "text*",
			inline: true,
			atom: true,
			marks: "",
			parseDOM: [{ tag: "inlinemath" }],
			toDOM(node) { return ["inlinemath", node.attrs, 0] }
		},

		math_block: {
			group: "block",
			content: "text*",
			defining: true,
			marks: "",
			parseDOM: [{ tag: "displaymath" }],
			toDOM(node) { return ["displaymath", node.attrs, 0] }
		}
	},

	marks: {
		em: {
			parseDOM: [{ tag: "i" }, { tag: "em" },
			{ style: "font-style", getAttrs: value => value == "italic" && null }],
			toDOM() { return ["em"] }
		},

		strong: {
			parseDOM: [{ tag: "b" }, { tag: "strong" },
			{ style: "font-weight", getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value as string) && null }],
			toDOM() { return ["strong"] }
		},

		link: {
			attrs: {
				href: {},
				title: { default: null }
			},
			inclusive: false,
			parseDOM: [{
				tag: "a[href]", getAttrs(dom) {
					return {
						href: (dom as HTMLElement).getAttribute("href"),
						title: (dom as HTMLElement).getAttribute("title")
					}
				}
			}],
			toDOM(node) { return ["a", node.attrs] }
		},

		code: {
			parseDOM: [{ tag: "code" }],
			toDOM() { return ["code"] }
		}
	}
});