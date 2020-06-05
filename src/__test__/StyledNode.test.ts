import { renderTree, StyledNode } from "RenderTree";
import { parseCSS, parseStyleAttrs } from "CSSParser";
import { parseHTML } from "HTMLParser";
import { Element } from "Node";
import { isElement, isText } from "utils";
import { Selector } from "StyleSheet";

type QueueObj = {
  tag?: string;
  text?: string;
  // attributes?: Map<string, string>;
  selectors?: Selector[];
  computedStyle?: Map<string, string>;
};

const EMPTY_MAP = new Map();
function traverse(renderTree: StyledNode, queue: QueueObj[] = []) {
  if (isElement(renderTree.node)) {
    queue.push({
      tag: renderTree.node.tag,
      // attributes: renderTree.node.attributes,
      selectors: renderTree.node.selectors,
      computedStyle: renderTree.computedStyle,
    });
  } else if (isText(renderTree.node)) {
    queue.push({
      text: renderTree.node.text,
    });
  }
  if (renderTree.children) {
    renderTree.children.forEach((child) => traverse(child, queue));
  }
  return queue;
}

const buildTree = (html: string, css: string) => {
  const HTML = parseHTML(html);
  const styleSheet = parseCSS(css);
  const tree = renderTree(HTML, styleSheet);
  return tree;
};

const matchOrder = (rest: QueueObj[]) => {
  return [
    {
      tag: "html",
      computedStyle: EMPTY_MAP,
    },
    ...rest,
  ];
};

const buildStyle = (styles: string) => {
  const declarations = parseStyleAttrs(styles);
  const map = new Map<string, string>();
  for (const declaration of declarations) {
    map.set(declaration.name, declaration.value);
  }
  return map;
};

describe("RenderTree", () => {
  it("id,class,tag selector works", () => {
    const tree = buildTree(
      `
        <html>
          <div style="color:red;" id="id" class="class"></div>
          <span></span>
        </html>
      `,
      `
        #id{
          border:1px solid red;
          color:blue;
          font-size:11px;
        }
        .class{
          color:green;
          font-size:8px;
          class:c;
        }
        span{
          color:red;
        }
      `
    );
    expect(traverse(tree)).toMatchObject(
      matchOrder([
        {
          tag: "div",
          computedStyle: buildStyle(`
          color:red;
          border:1px solid red;
          font-size:11px;
          class:c;
          `),
        },
        {
          tag: "span",
          computedStyle: buildStyle(`color:red;`),
        },
      ])
    );
  });

  it("grouping selector works ", () => {
    const tree = buildTree(
      `
        <div id="id" class="class"></div>
        <span></span>
    `,
      `
      #id,.class,span{
        border:1px solid red;
        color:blue;
        font-size:11px;
      }
    `
    );
    expect(traverse(tree)).toMatchObject(
      matchOrder([
        {
          tag: "div",
          computedStyle: buildStyle(`
          border:1px solid red;
          color:blue;
          font-size:11px;`),
        },
        {
          tag: "span",
          computedStyle: buildStyle(`
          border:1px solid red;
          color:blue;
          font-size:11px;`),
        },
      ])
    );
  });

  it("Combinators(>,+,~,` `) selectors works", () => {
    const tree = buildTree(
      `
        <div><span></span></div>
        <span></span>
        <section><div><span></span></div></section>
      `,
      `
      div > span{
         a:1;
      }
      div + span{
         b:2;
      }
      div~*{
        c:3;
      }
      section * {
        d:4;
      }
    `
    );
    expect(traverse(tree)).toMatchObject(
      matchOrder([
        {
          tag: "div",
          computedStyle: EMPTY_MAP,
        },
        { tag: "span", computedStyle: buildStyle(`a:1;`) },
        { tag: "span", computedStyle: buildStyle(`b:2;c:3;`) },
        {
          tag: "section",
          computedStyle: buildStyle(`c:3;`),
        },
        {
          tag: "div",
          computedStyle: buildStyle(`d:4;`),
        },
        { tag: "span", computedStyle: buildStyle(`d:4;a:1;`) },
      ])
    );
  });


});
