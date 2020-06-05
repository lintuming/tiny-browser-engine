import { Element, Node, NodeTypes, TextNode } from "Node";
import { Dimensions } from "Dimensions";
import { SupportedUnit } from "resolvers";
function assert(condiction: any, msg?: string) {
  if (!condiction) {
    throw Error(msg);
  }
}

function isText(node?: Node | null): node is TextNode {
  return node?.type === NodeTypes.Text;
}
function isElement(node?: Node | null): node is Element {
  return node?.type === NodeTypes.Element;
}

function last<T>(arrayLike: ArrayLike<T>) {
  const length = arrayLike.length;
  return arrayLike[length - 1];
}

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
function measureText(
  text: string,
  { fontSize, fontFamily }: { fontSize: number; fontFamily: string }
) {
  if (ctx) {
    ctx.font = `${fontSize}px ${fontFamily}`;
    return ctx?.measureText(text);
  }
}

function measureDimension(
  options: { unit: string; value: number } | null,
  percentageBase: number
) {
  if (options) {
    const { unit, value } = options;
    if (SupportedUnit[unit]) {
      const supported = SupportedUnit[unit];
      if (supported === SupportedUnit["%"]) {
        return value * percentageBase;
      } else {
        return value;
      }
    }
  }
  return 0;
}

function match(matched: boolean[], result: boolean[]) {
  return matched.every((m, i) => m === result[i]);
}

export { assert, isText, isElement, last, measureText, measureDimension ,match};
