import { Node, Element } from "Node";
import { StyleSheet, Rule, Selector, SelectorData, compare } from "StyleSheet";
import { isText, isElement } from "utils";
import { parseStyleAttrs } from "CSSParser";

export class RenderNode {
  node: Node;
  computedStyle: Map<string, string>;
  children: RenderNode[];
  constructor({
    node,
    computedStyle,
    children,
  }: {
    node: Node;
    computedStyle: Map<string, string>;
    children: RenderNode[];
  }) {
    this.node = node;
    this.computedStyle = computedStyle;
    this.children = children;
  }
}

function renderTree(node: Node, styleSheet: StyleSheet): RenderNode {
  if (isElement(node)) {
    return new RenderNode({
      node,
      computedStyle: computeStyle(node, styleSheet),
      children:
        node.children?.map((child) => renderTree(child, styleSheet)) ?? [],
    });
  } else
    return new RenderNode({
      node,
      computedStyle: new Map(),
      children: [],
    });
}

const pendding: Map<Node, Set<Selector>> = new Map();

function computeStyle(node: Element, styleSheet: StyleSheet) {
  const computedStyle = new Map<string, string>();
  const rules = matching_rules(node, styleSheet);
  rules.sort((a, b) => compare(a.selector.specificity, b.selector.specificity));

  for (const rule of rules) {
    for (const declaration of rule.declarations) {
      computedStyle.set(declaration.name, declaration.value);
    }
  }
  if (node.attributes.has("style")) {
    const styleDeclarations = parseStyleAttrs(node.attributes.get("style")!);
    for (const declaration of styleDeclarations) {
      computedStyle.set(declaration.name, declaration.value);
    }
  }
  return computedStyle;
}

function matching_rules(node: Element, styleSheet: StyleSheet) {
  const rules = [];
  for (const rule of styleSheet.rules) {
    const matched = match_rule(node, rule);
    rules.push(...matched);
  }
  return rules;
}

function match_rule(node: Element, rule: Rule) {
  const matched = [];
  for (const selector of rule.selectors) {
    if (match_selector(node, selector)) {
      matched.push({
        selector,
        declarations: rule.declarations,
      });
    }
  }
  return matched;
}

function match_selector(node: Element, selector: Selector) {
  if (pendding.has(node)) {
    const set = pendding.get(node)!;
    if (set.has(selector)) {
      return true;
    }
  }
  return matchData(0, selector, node);
}

function matchIdentifier(selectorData: SelectorData, node: Element) {
  if (selectorData.prefix) {
    switch (selectorData.prefix) {
      case "#":
        return node.attributes.get("id") === selectorData.identifier;
      case ".":
        return node.attributes.get("class") === selectorData.identifier;
      default:
        return false;
    }
  } else {
    return (
      node.tag === selectorData.identifier || selectorData.identifier === "*"
    );
  }
}

function matchData(idx: number, selector: Selector, node: Element) {
  const textData = selector.selectorText;
  const data = textData[idx];

  if (data && matchIdentifier(data, node)) {
    if (idx === textData.length - 1) {
      if (pendding.has(node)) {
        pendding.get(node)?.add(selector);
      } else {
        const set = new Set<Selector>();
        pendding.set(node, set);
        set.add(selector);
      }
      return true;
    }
    if (data.suffix) {
      const next = idx + 1;
      switch (data.suffix) {
        case ">":
          matchChild(next, selector, node);
          break;
        case "~": {
          matchSibling(next, selector, node);
          break;
        }
        case "+": {
          if (node.sibling && isElement(node.sibling)) {
            matchData(idx + 1, selector, node.sibling);
          }
          break;
        }
        case " ": {
          matchDescendants(next, selector, node);
        }
      }
    }
    return false;
  }
  return false;
}

function getAllSibling<T extends Node>(
  ele: Node,
  filter: (node: Node) => node is T
): T[] {
  const siblings = [];
  while (ele.sibling) {
    if (filter(ele.sibling)) {
      siblings.push(ele.sibling);
    }
    ele = ele.sibling;
  }
  return siblings;
}

function getDescendants<T extends Node>(
  ele: Element,
  filter: (node: Node) => node is T,
  buffer: T[] = []
): T[] {
  if (ele.children)
    for (const child of ele.children) {
      if (filter(child)) {
        buffer.push(child);
      }
      if (isElement(child)) {
        getDescendants(child, filter, buffer);
      }
    }
  return buffer;
}

function matchChild(idx: number, selector: Selector, node: Element) {
  node.children?.forEach(
    (child) => isElement(child) && matchData(idx, selector, child)
  );
}

function matchSibling(idx: number, selector: Selector, node: Element) {
  const siblings = getAllSibling<Element>(node, isElement);
  siblings.forEach((sib) => matchData(idx, selector, sib));
}

function matchDescendants(idx: number, selector: Selector, node: Element) {
  const descendants = getDescendants<Element>(node, isElement);

  descendants.forEach((descendant) => matchData(idx, selector, descendant));
}

export { renderTree };
