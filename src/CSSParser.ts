import Parser from "Parser";
import { assert } from "utils";
import {
  SelectorData,
  Selector,
  Declaration,
  Rule,
  StyleSheet,
} from "StyleSheet";

enum State {
  beforeSelector,
  selector,
  beforeName,
  name,
  beforeValue,
  value,
}

const IDENTIFIER_REGEXP = /[a-zA-Z0-9-_]/;

function valid_identifier_char(char: string) {
  return IDENTIFIER_REGEXP.test(char);
}

class CSSParser extends Parser {
  state: State;
  constructor({ source, pos }: { source: string; pos: number }) {
    super({ source, pos });
    this.state = State.beforeSelector;
  }
  setState(state: State) {
    this.state = state;
  }
  parseIdentifier() {
    const id = this.consume(valid_identifier_char);
    return id;
  }

  parseStylesheet() {
    return new StyleSheet(this.parseRules());
  }
  parseRule() {
    return new Rule({
      selectors: this.parseSelectors(),
      declarations: this.parseDeclarations(),
    });
  }
  parseRules() {
    const rules: Rule[] = [];
    while (this.skipWhitspace() != null && !this.eof()) {
      rules.push(this.parseRule());
    }
    return rules;
  }
  parseDeclarations() {
    assert(
      this.eat() === "{",
      this.printPosAfterEat("Expect declarations wrapped in {}")
    );
    const declarations: Declaration[] = [];
    while (
      this.skipWhitspace() != null &&
      !this.eof() &&
      this.next_char() !== "}"
    ) {
      this.assertState(State.beforeName);
      this.setState(State.name);
      const name = this.parseIdentifier();
      this.skipWhitspace();
      assert(this.eat() === ":", this.printPosAfterEat(`Expect an \`:\``));
      this.setState(State.beforeValue);
      this.skipWhitspace();
      this.setState(State.value);
      const value = this.consume((char) => char !== ";");
      assert(this.eat() === ";", this.printPosAfterEat("Expect an `;`"));
      this.setState(State.beforeName);
      declarations.push(new Declaration(name, value));
    }
    assert(this.eat() === "}", "Expect `}`");
    this.setState(State.beforeSelector);
    return declarations;
  }

  assertState(state: State, prefix = "") {
    assert(
      this.state === state,
      this.printCodeSnippet(
        `${prefix}:Expect in the state ${state},but now in ${this.state}`
      )
    );
  }

  parseSelector() {
    this.assertState(State.beforeSelector, "parseSelector");
    this.setState(State.selector);
    const selectorText: SelectorData[] = [];
    outer: while (this.skipWhitspace() != null && !this.eof()) {
      let identifier = "";
      let prefix = "";
      let suffix = "";
      const nextChar = this.next_char();
      inner: switch (nextChar) {
        case ",":
        case "{":
          break outer;
        case "#":
        case ".":
          prefix = this.eat();
        default: {
          identifier = this.parseIdentifier();
          this.skipWhitspace();
          const nextChar = this.next_char();
          switch (nextChar) {
            case ">":
            case "~":
            case "+":
              suffix = this.eat();
          }
          selectorText.push(new SelectorData({ identifier, suffix, prefix }));
          break inner;
        }
      }
    }
    this.setState(State.beforeSelector);
    return new Selector({ selectorText });
  }

  parseSelectors() {
    const selectors: Selector[] = [];
    while (
      this.skipWhitspace() != null &&
      !this.eof() &&
      selectors.push(this.parseSelector())
    ) {
      const nextChar = this.next_char();
      if (nextChar === ",") {
        this.eat();
        this.skipWhitspace();
      } else {
        assert(
          nextChar === "{",
          this.printCodeSnippet(
            `${this.pos}:UnExpected character in the Selector ${nextChar}`
          )
        );
        this.setState(State.beforeName);
        break;
      }
    }
    return selectors;
  }
}

const parseCSS = (source: string) => {
  const Parser = new CSSParser({ source, pos: 0 });
  return Parser.parseStylesheet();
};

const parseStyleAttrs = (source: string) => {
  source = `{${source}}`;
  const Parser = new CSSParser({ source, pos: 0 });
  Parser.setState(State.beforeName);
  return Parser.parseDeclarations();
};

export { parseCSS, CSSParser,parseStyleAttrs };
