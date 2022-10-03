const jsString = `
const a = 1;
let b = 2;
var c = 3;
log(a + b + c);

function add(param1, param2) {
  const tot = param1 + param2;
  return tot;
}

add(a, b);

const complexType = {
  a: 1,
  b: [1, 2, '3'],
  c: {
    d: true,
  },
  e: () => {
   const inner = 24;
  }
}`;

import { assert } from "chai";
import { Babeliser } from "../src/index";

const t = new Babeliser(jsString);

assert.equal(t.parsedCode.program.body.length, 7);

assert.equal(t.getVariableDeclarations().length, 6);
assert.equal(
  t
    .getVariableDeclarations()
    .filter((v) => v.scope.join() === "global,complexType,e").length,
  1
);
assert.equal(
  t.getVariableDeclarations().find((v) => v.declarations?.[0]?.id?.name === "a")
    ?.declarations?.[0]?.init?.value,
  1
);
assert.equal(
  t.getVariableDeclarations().find((v) => v.declarations?.[0]?.id?.name === "b")
    ?.declarations?.[0]?.init?.value,
  2
);
assert.equal(
  t.getVariableDeclarations().find((v) => v.declarations?.[0]?.id?.name === "c")
    ?.declarations?.[0]?.init?.value,
  3
);
assert.equal(
  t
    .getVariableDeclarations()
    .find((v) => v.declarations?.[0]?.id?.name === "inner")?.declarations?.[0]
    ?.init?.value,
  24
);
