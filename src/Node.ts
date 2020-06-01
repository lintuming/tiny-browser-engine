enum NodeTypes {
  Text,
  Element,
}

class BaseNode {
  type: NodeTypes;
  constructor({ type }: { type: NodeTypes }) {
    this.type = type;
  }
}

type Attributes = Map<string, string>;

type Node = Element | TextNode;

class Element extends BaseNode {
  tag: string;
  attributes: Attributes;
  children: Node[];
  constructor({
    tag,
    attributes,
    children,
  }: {
    tag: string;
    attributes: Attributes;
    children: Node[];
  }) {
    super({ type: NodeTypes.Element });
    this.tag = tag;
    this.attributes = attributes;
    this.children = children;
  }
}

class TextNode extends BaseNode {
  text: string;
  constructor({ text }: { text: string }) {
    super({ type: NodeTypes.Text });
    this.text = text;
  }
}

export { Element,TextNode,Node };
