import { Element, Node, NodeTypes, TextNode } from "Node";

function assert(condiction: any, msg?: string) {
  if (!condiction) {
    throw Error(msg);
  }
}

function isText(node?: Node|null): node is TextNode {
  return node?.type === NodeTypes.Text;
}
function isElement(node?: Node|null): node is Element {
  return node?.type === NodeTypes.Element;
}
export { assert ,isText,isElement};
