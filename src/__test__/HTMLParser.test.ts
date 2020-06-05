import { parseHTML } from "HTMLParser";
import { Element, TextNode, Node } from "Node";

function chainRelation(parent: Element, children: Node[]) {
  let prev: Node|null = null;
  for (const child of children) {
    if (prev) {
      prev.sibling = child;
    }
    prev = child;
    child.parent = parent;
  }
  parent.children = children;
  return parent;
}

describe("HTML Parser", () => {
  it("parse text", () => {
    expect(parseHTML("t1234")).toMatchObject(new TextNode({ text: "t1234" }));
  });

  it("parse single Element", () => {
    expect(parseHTML(`<html></html>`)).toMatchObject(
      new Element({ tag: "html", children: [], attributes: new Map() })
    );
  });

  it("parse Element with attributes,escape single quote and double quote", () => {
    expect(
      parseHTML(
        `<html id="1" style="color:red;" data-text="&quot;{}&quot;'"></html>`
      )
    ).toMatchObject(
      new Element({
        tag: "html",
        attributes: new Map([
          ["id", "1"],
          ["style", "color:red;"],
          ["data-text", `"{}"'`],
        ]),
        children: [],
      })
    );
  });

  it("parse Element with text child,and ignore extra whitespace", () => {
    expect(
      parseHTML(`<html>whitespace             whitespace</html>`)
    ).toMatchObject(
      chainRelation(
        new Element({
          tag: "html",
          children: [new TextNode({ text: `whitespace whitespace` })],
          attributes: new Map(),
        }),
        [new TextNode({ text: `whitespace whitespace` })]
      )
    );
  });

  it("parse Element with multiple child,trailing space and leading space should be ignored", () => {
    expect(
      parseHTML(
        `<html>
          <body>
            <div id="div" data-div="div">
              div
              <span>
                span
              </span>
            </div>
          </body>
        </html>`
      )
    ).toMatchObject(
      chainRelation(
        new Element({
          tag: "html",
          attributes: new Map(),
        }),
        [
          chainRelation(
            new Element({
              tag: "body",
              attributes: new Map(),
            }),
            [
              chainRelation(
                new Element({
                  tag: "div",
                  attributes: new Map([
                    ["id", "div"],
                    ["data-div", "div"],
                  ]),
                }),
                [
                  new TextNode({ text: "div" }),
                  chainRelation(
                    new Element({
                      tag: "span",
                      attributes: new Map(),
                    }),
                    [new TextNode({ text: "span" })]
                  ),
                ]
              ),
            ]
          ),
        ]
      )
    );
  });
});
