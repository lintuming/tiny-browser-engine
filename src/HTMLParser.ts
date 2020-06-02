import Parser, { BaseOptions, Overrides, TestFnMeta } from "Parser";
import { assert } from "utils";
import { TextNode, Element, Node } from "Node";

const TextEscapedMap = new Map([
  ["&amp;", "&"],
  ["&lt;", "<"],
  ["&gt;", ">"],
]);

const AttributeValEscapedMap = new Map([
  ["&quot;", '"'],
  ["&#39;", "'"],
]);
class HTMLParser extends Parser {
  escapeMap: Map<string, string> | null;
  constructor({ source, pos }: BaseOptions) {
    super({ source, pos });
    this.escapeMap = null;
  }

  parseTag() {
    return this.consume((char) => /[a-zA-Z0-9]/.test(char));
  }

  parseNode() {
    if (this.next_char() === "<") {
      return this.parseElement();
    } else {
      return this.parseText();
    }
  }

  parseElement() {
    assert(
      this.eat() === "<",
      this.printPosAfterEat('Expect an element start with "<" ')
    );
    const tag = this.parseTag();
    const attributes = this.parseAttributes();

    const children = this.parseNodes();

    assert(
      this.eat() === "<",
      this.printPosAfterEat(
        `Expect an element has eclosing tag with \`</${tag}>\` `
      )
    );
    assert(
      this.eat() === "/",
      this.printPosAfterEat(
        `Expect an element has eclosing tag with \`</${tag}>\` `
      )
    );
    assert(
      this.parseTag() === tag,
      this.printPosAfterEat(
        `Expect an element has eclosing tag with \`</${tag}>\` `
      )
    );
    assert(
      this.eat() === ">",
      this.printPosAfterEat(
        `Expect an element has eclosing tag with \`</${tag}>\` `
      )
    );
    const ele = new Element({ tag, attributes, children });
    children.forEach((child) => (child.parent = ele));

    return ele;
  }

  parseNodes() {
    const nodes: Node[] = [];
    let prev: Node | null = null;
    while (
      this.skipWhitspace() != null &&
      !this.eof() &&
      !this.startWith("</")
    ) {
      const node = this.parseNode();
      if (prev) {
        prev.sibling = node;
      }
      prev = node;
      nodes.push(node);
    }
    return nodes;
  }
  parseAttributes() {
    const attrs = new Map();
    while (
      this.skipWhitspace() != null &&
      !this.eof() &&
      this.next_char() !== ">"
    ) {
      const name = this.consume((char) => /[a-zA-Z0-9_-]/.test(char));
      assert(
        this.eat() === "=",
        this.printPosAfterEat(`Expect \`=\` following an attribute name `)
      );
      const value = this.parseAttributeVal();
      attrs.set(name, value);
    }
    assert(this.eat() === ">", `Expect element's attributes inside the \`<>\``);

    return attrs;
  }
  parseAttributeVal() {
    const open_cur = this.eat();
    assert(
      open_cur === "'" || open_cur === '"',
      this.printPosAfterEat(
        `Expect attribute value wrapped in an singleQuote or doubleQuote`
      )
    );
    this.escapeMap = AttributeValEscapedMap;
    const test = (char: string, meta: TestFnMeta): boolean => {
      if (char === open_cur) {
        return false;
      }
      this.escapeIfNeed(char, meta);
      return true;
    };
    const val = this.consume(test);
    assert(
      this.eat() === open_cur,
      this.printPosAfterEat(`Expect an attribute value `)
    );
    this.escapeMap = null;
    return val;
  }

  shouldEscape() {
    if (this.escapeMap) {
      for (const [escaped, result] of this.escapeMap.entries()) {
        if (this.startWith(escaped)) {
          return result;
        }
      }
    }
    return null;
  }

  escapeIfNeed(char: string, { overrides }: TestFnMeta) {
    if (char === "&") {
      const shouldEscape = this.shouldEscape();
      if (shouldEscape) {
        overrides({
          // override the move behavior
          move: () => {
            this.consume((char) => char !== ";");
            assert(this.eat() === ";");
            return shouldEscape;
          },
        });
      }
    }
  }

  // extra whitespace should be ignore
  ignoreWhitespaceIfNeed(char: string, { overrides }: TestFnMeta) {
    if (/\s/.test(char)) {
      overrides({
        move: () => {
          this.skipWhitspace();
          return char;
        },
      });
    }
  }
  parseText() {
    this.escapeMap = TextEscapedMap;
    const test = (char: string, meta: TestFnMeta): boolean => {
      if (char === "<") {
        return false;
      }
      this.escapeIfNeed(char, meta);
      this.ignoreWhitespaceIfNeed(char, meta);
      return true;
    };
    const text = this.consume(test).trimRight();
    this.escapeMap = null;
    return new TextNode({ text });
  }
}

function parseHTML(source: string) {
  const parser = new HTMLParser({ source, pos: 0 });
  const nodes = parser.parseNodes();
  if (nodes.length === 1) {
    return nodes[0];
  } else {
    const ele = new Element({
      tag: "html",
      children: nodes,
      attributes: new Map(),
    });
    nodes.forEach((node) => (node.parent = ele));
    return ele;
  }
}

export { HTMLParser, parseHTML };
