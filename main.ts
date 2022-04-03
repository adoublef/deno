const a = 3;
function b() { return 5; }
console.assert(a == b(), `expected ${a}; got ${b()}`);