import { parse } from "@babel/parser";
import { Identifier, VariableDeclaration } from "@babel/types";

type Scope = Array<string>;

export class Babeliser {
  public parsedCode: ReturnType<typeof parse>;

  constructor(codeString: string) {
    this.parsedCode = parse(codeString);
  }

  public getVariableDeclarations(): Array<
    VariableDeclaration & { scope: Scope }
  > {
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
    if (scope.length >= 4) {
      return;
    }
    const matches = [];
    if (typeof val === "object" && val !== null) {
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
