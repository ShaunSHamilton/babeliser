const jsString = `
import z from "z";
import { y } from "y";

const a = 1;
let b = 2;
var c = 3;
console.log(a + b + c);
  
function add(param1, param2) {
  const tot = param1 + param2;
  let currentWeapon;
  return tot;
}
  
add(a, b);

async function sub(param1, param2) {
  (() => {
    b++;
  })();
}

const complexType = {
  a: 1,
  b: [1, 2, '3'],
  c: {
    d: true,
  },
  e: () => {
    const inner = 24;
  }
}
`;

import {
  assertBinaryExpression,
  assertCallExpression,
  assertFunctionDeclaration,
  assertIdentifier,
  assertImportDeclaration,
  assertImportDefaultSpecifier,
  assertImportSpecifier,
  assertMemberExpression,
  assertNumericLiteral,
  assertReturnStatement,
  assertVariableDeclaration,
  assertVariableDeclarator,
} from "@babel/types";
import { assert } from "chai";
import { Babeliser } from "../src/index";

const t = new Babeliser(jsString);

assert.equal(t.parsedCode.program.body.length, 10);

// IMPORT DECLARATIONS

assert.equal(t.getImportDeclarations().length, 2);

const zImportDeclaration = t.getImportDeclarations().find((i) => {
  return i.specifiers[0].local.name === "z";
});
assertImportDeclaration(zImportDeclaration);
const zImportDefaultSpecifier = zImportDeclaration.specifiers[0];
assertImportDefaultSpecifier(zImportDefaultSpecifier);
const zSource = zImportDeclaration.source;
assert.equal(zSource.value, "z");

const yImportDeclaration = t.getImportDeclarations().find((i) => {
  return i.specifiers[0].local.name === "y";
});
assertImportDeclaration(yImportDeclaration);
const yImportSpecifier = yImportDeclaration.specifiers[0];
assertImportSpecifier(yImportSpecifier);
const yIdentifierLocal = yImportSpecifier.local;
assertIdentifier(yIdentifierLocal);
const yIdentifierImported = yImportSpecifier.imported;
assertIdentifier(yIdentifierImported);
assert.equal(yIdentifierLocal.name, "y");
assert.equal(yIdentifierImported.name, "y");
const ySource = yImportDeclaration.source;
assert.equal(ySource.value, "y");

// VARIABLE DECLARATIONS

assert.equal(t.getVariableDeclarations().length, 7);
assert.equal(
  t
    .getVariableDeclarations()
    .filter((v) => v.scope.join() === "global,complexType,e").length,
  1
);

const aVariableDeclaration = t.getVariableDeclarations().find((v) => {
  const variableDeclarator = v.declarations[0];
  assertVariableDeclarator(variableDeclarator);
  const identifier = variableDeclarator.id;
  assertIdentifier(identifier);
  return identifier.name === "a";
});
assertVariableDeclaration(aVariableDeclaration);
assert.equal(aVariableDeclaration.kind, "const");
assert.equal(aVariableDeclaration.scope.join(), "global");
const aNumericLiteral = aVariableDeclaration.declarations[0].init;
assertNumericLiteral(aNumericLiteral);
assert.equal(aNumericLiteral.value, 1);

const bVariableDeclaration = t.getVariableDeclarations().find((v) => {
  const variableDeclarator = v.declarations[0];
  assertVariableDeclarator(variableDeclarator);
  const identifier = variableDeclarator.id;
  assertIdentifier(identifier);
  return identifier.name === "b";
});
assertVariableDeclaration(bVariableDeclaration);
assert.equal(bVariableDeclaration.kind, "let");
assert.equal(bVariableDeclaration.scope.join(), "global");
const bNumericLiteral = bVariableDeclaration.declarations[0].init;
assertNumericLiteral(bNumericLiteral);
assert.equal(bNumericLiteral.value, 2);

const cVariableDeclaration = t.getVariableDeclarations().find((v) => {
  const variableDeclarator = v.declarations[0];
  assertVariableDeclarator(variableDeclarator);
  const identifier = variableDeclarator.id;
  assertIdentifier(identifier);
  return identifier.name === "c";
});
assertVariableDeclaration(cVariableDeclaration);
assert.equal(cVariableDeclaration.kind, "var");
assert.equal(cVariableDeclaration.scope.join(), "global");
const cNumericLiteral = cVariableDeclaration.declarations[0].init;
assertNumericLiteral(cNumericLiteral);
assert.equal(cNumericLiteral.value, 3);

const complexTypeVariableDeclaration = t.getVariableDeclarations().find((v) => {
  const variableDeclarator = v.declarations[0];
  assertVariableDeclarator(variableDeclarator);
  const identifier = variableDeclarator.id;
  assertIdentifier(identifier);
  return identifier.name === "complexType";
});
assertVariableDeclaration(complexTypeVariableDeclaration);
assert.equal(complexTypeVariableDeclaration.kind, "const");
assert.equal(complexTypeVariableDeclaration.scope.join(), "global");

const innerVariableDeclaration = t.getVariableDeclarations().find((v) => {
  const variableDeclarator = v.declarations[0];
  assertVariableDeclarator(variableDeclarator);
  const identifier = variableDeclarator.id;
  assertIdentifier(identifier);
  return identifier.name === "inner";
});
assertVariableDeclaration(innerVariableDeclaration);
assert.equal(innerVariableDeclaration.kind, "const");
assert.equal(innerVariableDeclaration.scope.join(), "global,complexType,e");
const innerNumericLiteral = innerVariableDeclaration.declarations[0].init;
assertNumericLiteral(innerNumericLiteral);
assert.equal(innerNumericLiteral.value, 24);

// EXPRESSION STATEMENTS

assert.equal(t.getExpressionStatements().length, 4);

const consoleExpression = t.getExpressionStatements().find((e) => {
  const callExpression = e.expression;
  assertCallExpression(callExpression);
  const memberExpression = callExpression.callee;
  assertMemberExpression(memberExpression);
  const object = memberExpression.object;
  assertIdentifier(object);
  const property = memberExpression.property;
  assertIdentifier(property);
  return object.name === "console" && property.name === "log";
});

const consoleCallExpression = consoleExpression?.expression;
assertCallExpression(consoleCallExpression);
const binaryExpression = consoleCallExpression.arguments[0];
assertBinaryExpression(binaryExpression);
const binaryExpressionLeft = binaryExpression.left;
assertBinaryExpression(binaryExpressionLeft);
const binaryExpressionLeftLeft = binaryExpressionLeft.left;
assertIdentifier(binaryExpressionLeftLeft);
const binaryExpressionLeftRight = binaryExpressionLeft.right;
assertIdentifier(binaryExpressionLeftRight);
const binaryExpressionRight = binaryExpression.right;
assertIdentifier(binaryExpressionRight);
assert.equal(binaryExpressionLeftLeft.name, "a");
assert.equal(binaryExpressionLeftRight.name, "b");
assert.equal(binaryExpressionRight.name, "c");

const addExpression = t.getExpressionStatements().find((e) => {
  const callExpression = e.expression;
  assertCallExpression(callExpression);
  const calleeIdentifier = callExpression.callee;
  if (calleeIdentifier.type === "Identifier") {
    assertIdentifier(calleeIdentifier);
    return calleeIdentifier.name === "add";
  }
  return false;
});
const addCallExpression = addExpression?.expression;
assertCallExpression(addCallExpression);
const addCalleeIdentifier = addCallExpression.callee;
assertIdentifier(addCalleeIdentifier);
assert.equal(addCalleeIdentifier.name, "add");
const addArguments = addCallExpression.arguments;
const addArgOneIdentifier = addArguments[0];
assertIdentifier(addArgOneIdentifier);
assert.equal(addArgOneIdentifier.name, "a");
const addArgTwoIdentifier = addArguments[1];
assertIdentifier(addArgTwoIdentifier);
assert.equal(addArgTwoIdentifier.name, "b");

// FUNCTION DECLARATIONS

assert.equal(t.getFunctionDeclarations().length, 2);

const addFunction = t.getFunctionDeclarations().find((f) => {
  return f.id?.name === "add";
});
assertFunctionDeclaration(addFunction);
assert.exists(addFunction);
const addFunctionParams = addFunction.params;
assert.equal(addFunctionParams.length, 2);
const addFunctionParamOne = addFunctionParams[0];
assertIdentifier(addFunctionParamOne);
assert.equal(addFunctionParamOne.name, "param1");
const addFunctionParamTwo = addFunctionParams[1];
assertIdentifier(addFunctionParamTwo);
assert.equal(addFunctionParamTwo.name, "param2");

const totVariable = addFunction.body.body[0];
assertVariableDeclaration(totVariable);
const totVariableDeclarator = totVariable.declarations[0];
assertVariableDeclarator(totVariableDeclarator);
const totIdentifier = totVariableDeclarator.id;
assertIdentifier(totIdentifier);
assert.equal(totIdentifier.name, "tot");
const totBinaryExpression = totVariableDeclarator.init;
assertBinaryExpression(totBinaryExpression);
const totBinaryLeftIdentifier = totBinaryExpression.left;
assertIdentifier(totBinaryLeftIdentifier);
assert.equal(totBinaryLeftIdentifier.name, "param1");
const totBinaryRightIdentifier = totBinaryExpression.right;
assertIdentifier(totBinaryRightIdentifier);
assert.equal(totBinaryRightIdentifier.name, "param2");

const returnStatement = addFunction.body.body.find((b) => {
  return b.type === "ReturnStatement";
});
assertReturnStatement(returnStatement);
const returnStatementArgument = returnStatement.argument;
assertIdentifier(returnStatementArgument);
assert.equal(returnStatementArgument.name, "tot");
