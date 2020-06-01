import { parseHTML } from "HTMLParser";
import { Element, TextNode } from "Node";

describe("HTML Parser", () => {
  it("parse single HTML", () => {
    expect(parseHTML(`<html></html>`)).toMatchObject(
      new Element({ tag: "html", children: [], attributes: new Map() })
    );
  });

  it("parse single HTML with attributes", () => {
    expect(
      parseHTML(`<html id="1" style="color:red;" data-text="\\"{}\\""></html>`)
    ).toMatchObject(
      new Element({
        tag: "html",
        attributes: new Map([
          ["id", "1"],
          ["style", "color:red;"],
          ["data-text", `"{}"`],
        ]),
        children: [],
      })
    );
  });
  it("parse single HTML with text child", () => {
    expect(
      parseHTML(`<html>1234124125 12515125 \\< asff </html>`)
    ).toMatchObject(
      new Element({
        tag: "html",
        children: [new TextNode({ text: `1234124125 12515125 < asff ` })],
        attributes: new Map(),
      })
    );
  });
});
