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

import { identifier, memberExpression } from "@babel/types";
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

// EXPRESSION STATEMENTS

assert.equal(t.getExpressionStatements().length, 2);

const consoleExpression = t.getExpressionStatements().find((e) => {
  const identifier = e.expression?.callee;
  return identifier.name === "log";
});
const binaryExpression = consoleExpression?.expression?.arguments?.[0];
assert.equal(binaryExpression?.left?.left?.name, "a");
assert.equal(binaryExpression?.left?.right?.name, "b");
assert.equal(binaryExpression?.right?.name, "c");

const addExpression = t.getExpressionStatements()[1];
assert.equal(addExpression.expression?.callee?.name, "add");
assert.equal(addExpression.expression?.arguments?.[0]?.name, "a");
assert.equal(addExpression.expression?.arguments?.[1]?.name, "b");

// FUNCTION DECLARATIONS

assert.equal(t.getFunctionDeclarations().length, 1);

const addFunction = t.getFunctionDeclarations()[0];
assert.equal(addFunction.id?.name, "add");
assert.equal(addFunction.params?.[0]?.name, "param1");
assert.equal(addFunction.params?.[1]?.name, "param2");

const totVariable = addFunction.body?.body?.[0];
assert.equal(totVariable?.declarations?.[0]?.id?.name, "tot");
assert.equal(totVariable?.declarations?.[0]?.init?.left?.name, "param1");
assert.equal(totVariable?.declarations?.[0]?.init?.right?.name, "param2");

const returnStatement = addFunction.body?.body?.[1];
assert.equal(returnStatement?.argument?.name, "tot");
