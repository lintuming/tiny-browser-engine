function assert(condiction: any, msg?: string) {
  if (!condiction) {
    throw Error(msg);
  }
}


export {
  assert
}