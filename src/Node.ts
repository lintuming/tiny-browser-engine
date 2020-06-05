import {  Selector } from "StyleSheet";

export enum NodeTypes {
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

export type Node = Element | TextNode;

class Element extends BaseNode {
  tag: string;
  attributes: Attributes;
  children?: Node[];
  parent: Node | null;
  sibling: Node | null;
  selectors?:Selector[]
  constructor({
    tag,
    attributes,
    children,
  }: {
    tag: string;
    attributes: Attributes;
    children?: Node[];
  }) {
    super({ type: NodeTypes.Element });
    this.tag = tag;
    this.attributes = attributes;
    this.children = children;
    this.parent = null;
    this.sibling = null;
  }
  // attach style
}

class TextNode extends BaseNode {
  text: string;
  parent: Node | null;
  sibling: Node | null;

  constructor({ text }: { text: string }) {
    super({ type: NodeTypes.Text });
    this.text = text;
    this.parent = null;
    this.sibling = null;
  }
}

export { Element, TextNode };
