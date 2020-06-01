import Parser, { BaseOptions, TestFn, TestFnResult } from "Parser";
import { assert } from "utils";
import { TextNode, Element, Node } from "Node";

class HTMLParser extends Parser {
  constructor({ source, pos }: BaseOptions) {
    super({ source, pos });
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
      this.printPosAfterEat('Expect an elment start with "<" ')
    );
    const tag = this.parseTag();
    const attributes = this.parseAttributes();
    const children = this.parseNodes();
    assert(this.eat() === "<");
    assert(this.eat() === "/");
    assert(this.parseTag() === tag);
    assert(this.eat() === ">");
    return new Element({ tag, children, attributes });
  }

  parseNodes() {
    const nodes: Node[] = [];
    while (this.skipWhitspace() && !this.eof() && !this.startWith("</")) {
      nodes.push(this.parseNode());
    }
    return nodes;
  }
  parseAttributes() {
    const attrs = new Map();
    while (this.skipWhitspace() && !this.eof() && this.next_char() !== ">") {
      const name = this.consume((char) => /[a-zA-Z0-9_-]/.test(char));
      assert(
        this.eat() === "=",
        this.printPosAfterEat(`Expect \`=\` following an  attribute name `)
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
    let prev = "";
    const test = (char: string): TestFnResult => {
      const isEscaped = prev === "\\";
      prev = char;
      if (isEscaped) {
        return [true, (result) => result.slice(0, result.length - 1)];
      }
      if (char === '"' || char === "'") {
        return false;
      }
      return true;
    };
    const val = this.consume(test);
    assert(
      this.eat() === open_cur,
      this.printPosAfterEat(`Expect an attribute value `)
    );
    return val;
  }
  parseText() {
    let prev = "";

    const test = (char: string): TestFnResult => {
      const isEscaped = prev === "\\";
      prev = char;
      if (isEscaped) {
        return [true, (result) => result.slice(0, result.length - 1)];
      }
      if (char === "<") {
        return false;
      }
      return true;
    };
    const text = this.consume(test);
    return new TextNode({ text });
  }
}

function parseHTML(source: string) {
  const parser = new HTMLParser({ source, pos: 0 });
  const nodes = parser.parseNodes();
  if (nodes.length === 1) {
    return nodes[0];
  } else {
    return new Element({ tag: "html", children: nodes, attributes: new Map() });
  }
}

export { HTMLParser, parseHTML };
