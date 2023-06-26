```typescript
export type State = string;

export class StateWrapper {
  constructor(private s: State) {}

  toString(): string {
    return this.s;
  }
}

export const Passed: State = "PASSED";
export const Failed: State = "FAILED";
export const Canceled: State = "CANCELLED";
export const Skipped: State = "SKIPPED";
export const Other: State = "OTHER";

const allValidState: State[] = [Passed, Failed, Canceled, Skipped];

export function allValidStates(): State[] {
  return allValidState;
}
```