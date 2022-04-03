interface Macro extends Function { }

export const panic: Macro = new Function("message", "throw new Error(message)");

export const todo: Macro = new Function("throw new Error('todo')");

export const println: Macro = new Function("...data", "console.log(...data)");
