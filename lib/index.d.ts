import { parse } from "@babel/parser";
import { VariableDeclaration } from "@babel/types";
declare type Scope = Array<string>;
export declare class Babeliser {
    parsedCode: ReturnType<typeof parse>;
    constructor(codeString: string);
    getVariableDeclarations(): Array<VariableDeclaration & {
        scope: Scope;
    }>;
    private _recurseBodiesForType;
    private _recurse;
}
export {};
//# sourceMappingURL=index.d.ts.map