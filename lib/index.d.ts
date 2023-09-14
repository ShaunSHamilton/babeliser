import { parse, ParserOptions } from "@babel/parser";
import { GeneratorOptions } from "@babel/generator";
import { ArrowFunctionExpression, ExpressionStatement, FunctionDeclaration, ImportDeclaration, Node, VariableDeclaration } from "@babel/types";
type BabeliserOptions = {
    maxScopeDepth: number;
};
type Scope = Array<string>;
export declare class Babeliser {
    parsedCode: ReturnType<typeof parse>;
    private maxScopeDepth;
    codeString: string;
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
    generateCode(ast: Node, options?: GeneratorOptions): string;
    getLineAndColumnFromIndex(index: number): {
        line: number;
        column: number | undefined;
    };
    private _isInScope;
    private _recurseBodiesForType;
    private _recurse;
}
export {};
