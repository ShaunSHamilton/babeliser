import {parse as $4sKNM$parse} from "@babel/parser";
import $4sKNM$babelgenerator from "@babel/generator";
import {is as $4sKNM$is} from "@babel/types";




class $d415641d0cfd8c85$export$ec4e4cf3d90ab517 {
    maxScopeDepth = 4;
    constructor(codeString, options){
        this.parsedCode = (0, $4sKNM$parse)(codeString, {
            sourceType: "module",
            ...options
        });
        if (options?.maxScopeDepth) this.maxScopeDepth = options.maxScopeDepth;
        this.codeString = codeString;
    }
    getArrowFunctionExpressions() {
        const arrowFunctionDeclarations = this._recurseBodiesForType("ArrowFunctionExpression");
        return arrowFunctionDeclarations;
    }
    getExpressionStatements() {
        const expressionStatements = this._recurseBodiesForType("ExpressionStatement");
        return expressionStatements;
    }
    getFunctionDeclarations() {
        const functionDeclarations = this._recurseBodiesForType("FunctionDeclaration");
        return functionDeclarations;
    }
    getImportDeclarations() {
        const expressionStatements = this._recurseBodiesForType("ImportDeclaration");
        return expressionStatements;
    }
    getType(type) {
        return this._recurseBodiesForType(type);
    }
    getVariableDeclarations() {
        const variableDeclarations = this._recurseBodiesForType("VariableDeclaration");
        return variableDeclarations;
    }
    getExpressionStatement(name, scope = [
        "global"
    ]) {
        const expressionStatements = this.getExpressionStatements().filter((a)=>this._isInScope(a.scope, scope));
        const expressionStatement = expressionStatements.find((e)=>{
            const expression = e.expression;
            if ((0, $4sKNM$is)("CallExpression", expression)) {
                if (name.includes(".")) {
                    const [objectName, methodName] = name.split(".");
                    const memberExpression = expression.callee;
                    if ((0, $4sKNM$is)("MemberExpression", memberExpression)) {
                        const object = memberExpression.object;
                        const property = memberExpression.property;
                        if ((0, $4sKNM$is)("Identifier", object) && (0, $4sKNM$is)("Identifier", property)) return object.name === objectName && property.name === methodName;
                    }
                }
                const identifier = expression.callee;
                if ((0, $4sKNM$is)("Identifier", identifier) && identifier.name === name) return true;
            }
            if ((0, $4sKNM$is)("AwaitExpression", expression)) {
                const callExpression = expression.argument;
                if ((0, $4sKNM$is)("CallExpression", callExpression)) {
                    const identifier = callExpression.callee;
                    if ((0, $4sKNM$is)("Identifier", identifier)) return identifier.name === name;
                }
            }
            return false;
        });
        return expressionStatement;
    }
    generateCode(ast, options) {
        return (0, $4sKNM$babelgenerator).default(ast, options).code;
    }
    getLineAndColumnFromIndex(index) {
        const linesBeforeIndex = this.codeString.slice(0, index).split("\n");
        const line = linesBeforeIndex.length;
        const column = linesBeforeIndex.pop()?.length;
        return {
            line: line,
            column: column
        };
    }
    _isInScope(scope, targetScope = [
        "global"
    ]) {
        if (targetScope.length === 1 && targetScope[0] === "global") return true;
        if (scope.length < targetScope.length) return false;
        const scopeString = scope.join(".");
        const targetScopeString = targetScope.join(".");
        return scopeString.includes(targetScopeString);
    }
    _recurseBodiesForType(type) {
        const body = this.parsedCode.program.body;
        const types = [];
        for (const statement of body){
            const a = this._recurse(statement, (a)=>a?.type === type, [
                "global"
            ]);
            if (a?.length) types.push(...a);
        }
        return types;
    }
    _recurse(// this is kind of a hack, since we're mutating val. It needs to be able to
    // have a scope parameter, though it's never passed in with one.
    val, isTargetType, scope) {
        if (scope.length >= this.maxScopeDepth) return;
        const matches = [];
        if (val && typeof val === "object") {
            if (!Array.isArray(val)) val.scope = scope;
            if (isTargetType(val)) matches.push(val);
            let currentScope = [
                ...scope
            ];
            const nearestIdentifier = Object.values(val).find((v)=>v?.type === "Identifier");
            if (nearestIdentifier) currentScope.push(nearestIdentifier.name);
            for (const v of Object.values(val)){
                const mat = this._recurse(v, isTargetType, currentScope);
                const toPush = mat?.filter(Boolean).flat();
                if (toPush?.length) matches.push(...toPush.flat());
            }
        }
        return matches;
    }
}


export {$d415641d0cfd8c85$export$ec4e4cf3d90ab517 as Babeliser};
