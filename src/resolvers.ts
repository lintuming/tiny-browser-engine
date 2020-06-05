export enum SupportedUnit {
  px,
  "%",
}

// 123px -> { value:123,unit:px }
function SimpleResolver(value: string) {
  const v = parseFloat(value);
  const unit = value.replace(/[0-9]/g, "");
  if (SupportedUnit[unit]) {
    return {
      value: v,
      unit,
    };
  }
  return null;
}

function AutoResolver(value: string) {
  if (value === "auto") {
    return {
      auto: true,
      unit: "",
      value: 0,
    };
  }
  const resolver = SimpleResolver(value);
  return resolver ? { ...resolver, auto: false } : null;
}
function borderResolver(value: string) {
  const splited = value.split(/\s+/);
  const v = parseFloat(splited[0]);
  const unit = value.replace(/[0-9]/g, "");
  const type = splited[1]; //dashed solid
  const color = splited[2];
  if (SupportedUnit[unit]) {
    return {
      value: v,
      type,
      unit,
      color,
    };
  }
  return null;
}

const resolver = {
  
  width: AutoResolver,
  height: AutoResolver,

  border: borderResolver,
  "border-top": borderResolver,
  "border-left": borderResolver,
  "border-bottom": borderResolver,
  "border-right": borderResolver,

  margin: AutoResolver,
  "margin-top": AutoResolver,
  "margin-left": AutoResolver,
  "margin-bottom": AutoResolver,
  "margin-right": AutoResolver,

  padding: SimpleResolver,
  "padding-top": SimpleResolver,
  "padding-left": SimpleResolver,
  "padding-bottom": SimpleResolver,
  "padding-right": SimpleResolver,
};

export { resolver };
