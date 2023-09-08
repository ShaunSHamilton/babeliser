// import { parse, ParserOptions } from "@babel/parser";
import parser from "@babel/parser";
import generator from "@babel/generator";
import {
  // ArrowFunctionExpression,
  // ExpressionStatement,
  // FunctionDeclaration,
  // Identifier,
  // ImportDeclaration,
  is,
  // Node,
  // VariableDeclaration,
  // Statement,
} from "@babel/types";

const { parse } = parser;

/**
 * @typedef {import("@babel/types").ArrowFunctionExpression} ArrowFunctionExpression
 * @typedef {import("@babel/types").ExpressionStatement} ExpressionStatement
 * @typedef {import("@babel/types").FunctionDeclaration} FunctionDeclaration
 * @typedef {import("@babel/types").Identifier} Identifier
 * @typedef {import("@babel/types").ImportDeclaration} ImportDeclaration
 * @typedef {import("@babel/types").Node} Node
 * @typedef {import("@babel/types").VariableDeclaration} VariableDeclaration
 * @typedef {import("@babel/types").Statement} Statement
 * @typedef {import("@babel/parser").ParserOptions} ParserOptions
 * @typedef {import("@babel/generator").GeneratorOptions} GeneratorOptions
 */

/**
 * @typedef {{maxScopeDepth?: number} & Partial<ParserOptions>} BabeliserOptions
 */

/**
 * @typedef {Array<string>} Scope
 */

/**
 * @typedef {{scope: Scope} & Statement} ScopedStatement
 */

export class Babeliser {
  /**
   * @param {string} codeString - The code to parse
   * @param {BabeliserOptions} options - Options for the parser
   */
  constructor(codeString, options) {
    this.parsedCode = parse(codeString, {
      sourceType: "module",
      ...options,
    });
    if (options?.maxScopeDepth) {
      this.maxScopeDepth = options.maxScopeDepth;
    }
    this.codeString = codeString;
  }

  getArrowFunctionExpressions() {
    /**
     * @type {Array<ArrowFunctionExpression & {scope: Scope}>}
     */
    const arrowFunctionDeclarations = this.#_recurseBodiesForType(
      "ArrowFunctionExpression"
    );
    return arrowFunctionDeclarations;
  }
  getExpressionStatements() {
    /**
     * @type {Array<ExpressionStatement & {scope: Scope}>}
     */
    const expressionStatements = this.#_recurseBodiesForType(
      "ExpressionStatement"
    );
    return expressionStatements;
  }
  getFunctionDeclarations() {
    /**
     * @type {Array<FunctionDeclaration & {scope: Scope}>}
     */
    const functionDeclarations = this.#_recurseBodiesForType(
      "FunctionDeclaration"
    );
    return functionDeclarations;
  }
  getImportDeclarations() {
    /**
     * @type {Array<ImportDeclaration & {scope: Scope}>}
     */
    const expressionStatements =
      this.#_recurseBodiesForType("ImportDeclaration");
    return expressionStatements;
  }

  /**
   * @template T
   * @param {string} type
   * @returns {Array<T & {scope: Scope}>}
   */
  getType(type) {
    return this.#_recurseBodiesForType(type);
  }
  getVariableDeclarations() {
    /**
     * @type {Array<VariableDeclaration & {scope: Scope}>}
     */
    const variableDeclarations = this.#_recurseBodiesForType(
      "VariableDeclaration"
    );
    return variableDeclarations;
  }

  /**
   * @param {string} name
   * @param {Scope} scope
   * @returns {ExpressionStatement & {scope: Scope} | undefined}
   */
  getExpressionStatement(name, scope) {
    const expressionStatements = this.getExpressionStatements().filter((a) =>
      this.#_isInScope(a.scope, scope)
    );
    const expressionStatement = expressionStatements.find((e) => {
      const expression = e.expression;
      if (is("CallExpression", expression)) {
        if (name.includes(".")) {
          const [objectName, methodName] = name.split(".");
          const memberExpression = expression.callee;
          if (is("MemberExpression", memberExpression)) {
            const object = memberExpression.object;
            const property = memberExpression.property;
            if (is("Identifier", object) && is("Identifier", property)) {
              return object.name === objectName && property.name === methodName;
            }
          }
        }
        const identifier = expression.callee;
        if (is("Identifier", identifier) && identifier.name === name) {
          return true;
        }
      }
      if (is("AwaitExpression", expression)) {
        const callExpression = expression.argument;
        if (is("CallExpression", callExpression)) {
          const identifier = callExpression.callee;
          if (is("Identifier", identifier)) {
            return identifier.name === name;
          }
        }
      }
      return false;
    });
    return expressionStatement;
  }

  /**
   * @param {Node} ast
   * @param {GeneratorOptions | undefined} options
   * @returns {string}
   */
  generateCode(ast, options) {
    return generator.default(ast, options).code;
  }

  /**
   * @param {number} index
   * @returns {{line: number, column: number | undefined}}
   */
  getLineAndColumnFromIndex(index) {
    const linesBeforeIndex = this.codeString.slice(0, index).split("\n");
    const line = linesBeforeIndex.length;
    const column = linesBeforeIndex.pop()?.length;
    return { line, column };
  }

  /**
   * @param {Scope} scope
   * @param {Scope} targetScope
   * @returns {boolean}
   */
  #_isInScope(scope, targetScope = ["global"]) {
    if (targetScope.length === 1 && targetScope[0] === "global") {
      return true;
    }
    if (scope.length < targetScope.length) {
      return false;
    }
    const scopeString = scope.join(".");
    const targetScopeString = targetScope.join(".");
    return scopeString.includes(targetScopeString);
  }

  /**
   * @template T
   * @param {string} type
   * @returns {Array<T & {scope: Scope}>}
   */
  #_recurseBodiesForType(type) {
    const body = this.parsedCode.program.body;
    const types = [];
    for (const statement of body) {
      const a = this.#_recurse(statement, (a) => a?.type === type, ["global"]);
      if (a?.length) {
        types.push(...a);
      }
    }
    return types;
  }

  /**
   * @param {Statement & {scope?: Scope}} val
   * @param {(...args: any) => boolean} isTargetType
   * @param {Array<string>} scope
   * @returns {Array<ScopedStatement>}
   */
  #_recurse(
    // this is kind of a hack, since we're mutating val. It needs to be able to
    // have a scope parameter, though it's never passed in with one.
    val,
    isTargetType,
    scope
  ) {
    if (scope.length >= this.maxScopeDepth) {
      return;
    }
    const matches = [];
    if (val && typeof val === "object") {
      if (!Array.isArray(val)) {
        val.scope = scope;
      }
      if (isTargetType(val)) {
        matches.push(val);
      }

      let currentScope = [...scope];
      /**
       * @type {Identifier | undefined}
       */
      const nearestIdentifier = Object.values(val).find(
        (v) => v?.type === "Identifier"
      );
      if (nearestIdentifier) {
        currentScope.push(nearestIdentifier.name);
      }

      for (const v of Object.values(val)) {
        const mat = this.#_recurse(v, isTargetType, currentScope);
        const toPush = mat?.filter(Boolean).flat();
        if (toPush?.length) {
          matches.push(...toPush.flat());
        }
      }
    }
    return matches;
  }
}
