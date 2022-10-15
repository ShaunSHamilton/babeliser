import { parse, ParserOptions } from "@babel/parser";
import {
  ExpressionStatement,
  FunctionDeclaration,
  Identifier,
  ImportDeclaration,
  VariableDeclaration,
} from "@babel/types";

type Scope = Array<string>;

export class Babeliser {
  public parsedCode: ReturnType<typeof parse>;

  constructor(codeString: string, options?: ParserOptions) {
    this.parsedCode = parse(codeString, {
      sourceType: "module",
      ...options,
    });
  }

  public getVariableDeclarations(): Array<
    VariableDeclaration & { scope: Scope }
  > {
    const variableDeclarations = this._recurseBodiesForType<
      VariableDeclaration & { scope: Scope }
    >("VariableDeclaration");
    return variableDeclarations;
  }
  public getFunctionDeclarations(): Array<
    FunctionDeclaration & { scope: Scope }
  > {
    const functionDeclarations = this._recurseBodiesForType<
      FunctionDeclaration & { scope: Scope }
    >("FunctionDeclaration");
    return functionDeclarations;
  }
  public getExpressionStatements(): Array<
    ExpressionStatement & { scope: Scope }
  > {
    const expressionStatements = this._recurseBodiesForType<
      ExpressionStatement & { scope: Scope }
    >("ExpressionStatement");
    return expressionStatements;
  }
  public getImportDeclarations() {
    const expressionStatements = this._recurseBodiesForType<
      ImportDeclaration & { scope: Scope }
    >("ImportDeclaration");
    return expressionStatements;
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
    if (scope.length >= 4) {
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
