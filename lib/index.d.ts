import { parse, ParserOptions } from "@babel/parser";
import { ArrowFunctionExpression, ExpressionStatement, FunctionDeclaration, ImportDeclaration, VariableDeclaration } from "@babel/types";
declare type BabeliserOptions = {
    maxScopeDepth: number;
};
declare type Scope = Array<string>;
export declare class Babeliser {
    parsedCode: ReturnType<typeof parse>;
    private maxScopeDepth;
    constructor(codeString: string, options?: Partial<ParserOptions & BabeliserOptions>);
    getArrowFunctionExpressions(): (ArrowFunctionExpression & {
        scope: Scope;
    })[];
    getExpressionStatements(): (ExpressionStatement & {
        scope: Scope;
    })[];
    getFunctionDeclarations(): (FunctionDeclaration & {
        scope: Scope;
    })[];
    getImportDeclarations(): (ImportDeclaration & {
        scope: Scope;
    })[];
    getType<T>(type: string): (T & {
        scope: Scope;
    })[];
    getVariableDeclarations(): (VariableDeclaration & {
        scope: Scope;
    })[];
    getExpressionStatement(name: string, scope?: Scope): (ExpressionStatement & {
        scope: Scope;
    }) | undefined;
    private _isInScope;
    private _recurseBodiesForType;
    private _recurse;
}
export {};
//# sourceMappingURL=index.d.ts.map