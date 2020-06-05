

export type BaseOptions = { source: string; pos: number };

export interface Overrides {
  (options: { move: () => string }): void;
}

export type TestFnMeta = {
  overrides: Overrides;
};
export interface TestFn {
  (char: string, meta: TestFnMeta): boolean;
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

  eat<T extends string>(): T {
    const next_char = this.next_char();
    this.pos++;
    return next_char as T;
  }
  eof() {
    return this.pos >= this.source.length;
  }

  consume(test: TestFn) {
    let result = "";
    const originMove = this.eat.bind(this);
    let move:()=>string = originMove;
    const overrides = (options: { move: () => string }) => {
      move = options.move;
    };
    while (!this.eof() && test(this.next_char(), { overrides })) {
      result += move();
      move = originMove;
    }
    return result;
  }
  startWith(char: string) {
    return this.source.startsWith(char, this.pos);
  }

  skipWhitspace() {
    return this.consume((char) => /\s/.test(char));
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
