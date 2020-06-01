export type BaseOptions = { source: string; pos: number };

export type TestFnResult = [boolean, (result: string) => string] | boolean;

export interface TestFn {
  (char: string): TestFnResult;
}

class Parser {
  source: string;
  pos: number;

  constructor({ source, pos }: BaseOptions) {
    this.source = source;
    this.pos = pos;
  }
  next_char() {
    return this.source[this.pos];
  }

  eat() {
    const next_char = this.next_char();
    this.pos++;
    return next_char;
  }
  eof() {
    return this.pos >= this.source.length;
  }
  consume(test: TestFn) {
    let result = "";
    while (!this.eof()) {
      const testResult = test(this.next_char());
      let pass = false;
      let rewrite = (f: string) => f;
      if (Array.isArray(testResult)) {
        [pass, rewrite] = testResult;
      } else {
        pass = testResult;
      }
      if (pass) {
        result = rewrite(result);
        result += this.eat();
      } else {
        break;
      }
    }
    return result;
  }

  startWith(char: string) {
    return this.source.startsWith(char, this.pos);
  }
  skipWhitspace() {
    this.consume((char) => /\s/.test(char));
    return true;
  }
  printCodeSnippet(msg?: string, pos?: number) {
    pos = pos || this.pos;
    const from = Math.max(0, pos - 10);
    const trimmed = from > 0 ? true : false;
    const padding = (trimmed ? 3 : 0) + (pos - from);
    const snippet = [
      (trimmed ? "..." : "") + this.source.slice(from, pos + 1),
      " ".repeat(padding) + "^",
      " ".repeat(padding) + msg,
    ].join("\n");
    return snippet;
  }
  printPosAfterEat(msg?: string) {
    return `${this.printCodeSnippet(`${this.pos - 1}:${msg}`, this.pos - 1)}`;
  }
}

export default Parser;
