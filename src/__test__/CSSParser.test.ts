import { parseCSS, parseStyleAttrs } from "CSSParser";
import {
  StyleSheet,
  Declaration,
  Rule,
  Selector,
  SelectorData,
} from "Stylesheet";

describe("CSS Parser", () => {
  it("parse style attribute", () => {
    expect(parseStyleAttrs(`color:red;border:1px solid red;`)).toMatchObject([
      new Declaration("color", "red"),
      new Declaration("border", "1px solid red"),
    ]);
  });

  it("parse simple rule", () => {
    expect(
      parseCSS(`
     .class   {
       color:red;
     }
    `)
    ).toMatchObject(
      new StyleSheet([
        new Rule({
          selectors: [
            new Selector({
              selectorText: [
                new SelectorData({ identifier: "class", prefix: "." }),
              ],
            }),
          ],
          declarations: [new Declaration("color", "red")],
        }),
      ])
    );
  });

  it("parse combinators selectors", () => {
    expect(
      parseCSS(`
      .class #div > span {
        color:red;
      }
    `)
    ).toMatchObject(
      new StyleSheet([
        new Rule({
          selectors: [
            new Selector({
              selectorText: [
                new SelectorData({ identifier: "class", prefix: "." }),
                new SelectorData({
                  identifier: "div",
                  prefix: "#",
                  suffix: ">",
                }),
                new SelectorData({ identifier: "span" }),
              ],
            }),
          ],
          declarations: [new Declaration("color", "red")],
        }),
      ])
    );
  });

  it("parse Grouping selectors", () => {
    expect(
      parseCSS(`
      .class #id >span , div , #span {
        color:red;
      }
    `)
    ).toMatchObject(
      new StyleSheet([
        new Rule({
          selectors: [
            new Selector({
              selectorText: [
                new SelectorData({ identifier: "class", prefix: "." }),
                new SelectorData({
                  identifier: "id",
                  prefix: "#",
                  suffix: ">",
                }),
                new SelectorData({ identifier: "span" }),
              ],
            }),
            new Selector({
              selectorText: [new SelectorData({ identifier: "div" })],
            }),
            new Selector({
              selectorText: [
                new SelectorData({ identifier: "span", prefix: "#" }),
              ],
            }),
          ],
          declarations: [new Declaration("color", "red")],
        }),
      ])
    );
  });

  it("parse multiple declarations", () => {
    expect(
      parseCSS(`
      .class {
        color:red;
        font-size:red;
        border:1px solid red;
      }
    `)
    ).toMatchObject(
      new StyleSheet([
        new Rule({
          selectors: [
            new Selector({
              selectorText: [
                new SelectorData({ identifier: "class", prefix: "." }),
              ],
            }),
          ],
          declarations: [
            new Declaration("color", "red"),
            new Declaration("font-size", "red"),
            new Declaration("border", "1px solid red"),
          ],
        }),
      ])
    );
  });

  it("parse multiple rules", () => {
    expect(
      parseCSS(`
    .class {
      color:red;
      font-size:red;
      border:1px solid red;
    }
    .class #id >span , div , #span {
      color:red;
    }

    .class #div > span {
      color:red;
    }

    `)
    ).toMatchObject(
      new StyleSheet([
        new Rule({
          selectors: [
            new Selector({
              selectorText: [
                new SelectorData({ identifier: "class", prefix: "." }),
              ],
            }),
          ],
          declarations: [
            new Declaration("color", "red"),
            new Declaration("font-size", "red"),
            new Declaration("border", "1px solid red"),
          ],
        }),
        new Rule({
          selectors: [
            new Selector({
              selectorText: [
                new SelectorData({ identifier: "class", prefix: "." }),
                new SelectorData({
                  identifier: "id",
                  prefix: "#",
                  suffix: ">",
                }),
                new SelectorData({ identifier: "span" }),
              ],
            }),
            new Selector({
              selectorText: [new SelectorData({ identifier: "div" })],
            }),
            new Selector({
              selectorText: [
                new SelectorData({ identifier: "span", prefix: "#" }),
              ],
            }),
          ],
          declarations: [new Declaration("color", "red")],
        }),
        new Rule({
          selectors: [
            new Selector({
              selectorText: [
                new SelectorData({ identifier: "class", prefix: "." }),
                new SelectorData({
                  identifier: "div",
                  prefix: "#",
                  suffix: ">",
                }),
                new SelectorData({ identifier: "span" }),
              ],
            }),
          ],
          declarations: [new Declaration("color", "red")],
        }),
      ])
    );
  });
});
