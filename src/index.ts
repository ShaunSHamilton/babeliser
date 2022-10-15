import { parse, ParserOptions } from "@babel/parser";
import {
  ArrowFunctionExpression,
  ExpressionStatement,
  FunctionDeclaration,
  Identifier,
  ImportDeclaration,
  VariableDeclaration,
} from "@babel/types";

type BabeliserOptions = { maxScopeDepth: number };
type Scope = Array<string>;

export class Babeliser {
  public parsedCode: ReturnType<typeof parse>;
  private maxScopeDepth = 4;
  constructor(
    codeString: string,
    options?: Partial<ParserOptions & BabeliserOptions>
  ) {
    this.parsedCode = parse(codeString, {
      sourceType: "module",
      ...options,
    });
    if (options?.maxScopeDepth) {
      this.maxScopeDepth = options.maxScopeDepth;
    }
  }
  public getArrowFunctionExpressions() {
    const arrowFunctionDeclarations = this._recurseBodiesForType<
      ArrowFunctionExpression & { scope: Scope }
    >("ArrowFunctionExpression");
    return arrowFunctionDeclarations;
  }
  public getExpressionStatements() {
    const expressionStatements = this._recurseBodiesForType<
      ExpressionStatement & { scope: Scope }
    >("ExpressionStatement");
    return expressionStatements;
  }
  public getFunctionDeclarations() {
    const functionDeclarations = this._recurseBodiesForType<
      FunctionDeclaration & { scope: Scope }
    >("FunctionDeclaration");
    return functionDeclarations;
  }
  public getImportDeclarations() {
    const expressionStatements = this._recurseBodiesForType<
      ImportDeclaration & { scope: Scope }
    >("ImportDeclaration");
    return expressionStatements;
  }
  public getType<T>(type: string) {
    return this._recurseBodiesForType<T & { scope: Scope }>(type);
  }
  public getVariableDeclarations() {
    const variableDeclarations = this._recurseBodiesForType<
      VariableDeclaration & { scope: Scope }
    >("VariableDeclaration");
    return variableDeclarations;
  }

  private _recurseBodiesForType<T>(type: string): Array<T> {
    const body = this.parsedCode.program.body;
    const types = [];
    for (const bod of body) {
      const a = this._recurse(bod, (a) => a?.type === type, ["global"]);
      if (a?.length) {
        types.push(...a);
      }
    }
    return types;
  }

  private _recurse(
    val: unknown,
    returnCondition: (...args: any) => boolean,
    scope: Array<string>
  ) {
    if (scope.length >= this.maxScopeDepth) {
      return;
    }
    const matches = [];
    if (val && typeof val === "object") {
      if (!Array.isArray(val)) {
        // @ts-ignore Force it.
        val.scope = scope;
      }
      if (returnCondition(val)) {
        matches.push(val);
      }

      let currentScope = [...scope];
      const nearestIdentifier: undefined | Identifier = Object.entries(
        val
      ).find(([_k, v]) => v?.type === "Identifier")?.[1];
      if (nearestIdentifier) {
        currentScope.push(nearestIdentifier.name);
      }

      for (const [_k, v] of Object.entries(val)) {
        const mat = this._recurse(v, returnCondition, currentScope);
        const toPush = mat?.filter(Boolean).flat();
        if (toPush?.length) {
          matches.push(...toPush.flat());
        }
      }
    }
    return matches;
  }
}
