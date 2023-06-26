type IntSet = Map<number, null>;

function newIntSet(): IntSet {
    return new Map<number, null>();
}

function add(s: IntSet, i: number): void {
    s.set(i, null);
}

function has(s: IntSet, i: number): boolean {
    return s.has(i);
}