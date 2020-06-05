type ID_SPECIFICITY = number;

type CLASS_SPECIFICITY = number;

type TAG_SPECIFICITY = number;

type Specificitys = [ID_SPECIFICITY, CLASS_SPECIFICITY, TAG_SPECIFICITY];

// compare the Specificitys
function compare(a: Specificitys, b: Specificitys) {
  for (let i = 0; i < 3; i++) {
    const m = a[i];
    const n = b[i];
    if (m === n) {
      continue;
    }
    return m - n > 0 ? 1 : -1;
  }
  return 0;
}

class StyleSheet {
  rules: Rule[];
  constructor(rules: Rule[]) {
    this.rules = rules;
  }
}

class Rule {
  selectors: Selector[];
  declarations: Declaration[];
  constructor(options: { selectors: Selector[]; declarations: Declaration[] }) {
    this.selectors = options.selectors;
    this.declarations = options.declarations;
  }
}

class Selector {
  selectorText: SelectorData[];

  private specificityCache?: Specificitys;
  constructor({ selectorText }: { selectorText: SelectorData[] }) {
    this.selectorText = selectorText;
  }

  get specificity() {
    if (this.specificityCache != null) {
      return this.specificityCache;
    }
    let id = 0;
    let classname = 0;
    let tag = 0;
    this.selectorText.forEach((data) => {
      if (data.prefix) {
        if (data.prefix === ".") {
          classname++;
        } else if (data.prefix === "#") {
          id++;
        }
      } else {
        if (data.identifier !== "*") tag++;
      }
    });
    this.specificityCache = [id, classname, tag];
    return this.specificityCache;
  }
}

class SelectorData {
  identifier: string;
  prefix?: string;
  suffix?: string;
  constructor({
    identifier,
    prefix,
    suffix,
  }: {
    identifier: string;
    prefix?: "#" | ".";
    suffix?: "+" | ">" | "~" | " ";
  }) {
    this.identifier = identifier;
    this.suffix = suffix;
    this.prefix = prefix;
  }
}

class Declaration {
  name: string;
  value: string;
  constructor(name: string, value: string) {
    this.name = name;
    this.value = value;
  }
}

export { StyleSheet, Selector, Rule, Declaration, SelectorData, compare };
