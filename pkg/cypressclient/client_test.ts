```typescript
import { RunResult } from './RunResult';

export class RunResults extends Array<RunResult> {
  reverse(): RunResults {
    return this.slice().reverse() as RunResults;
  }
}

// Test code
import { expect } from 'chai';
import 'mocha';

describe('RunResults', () => {
  it('Should reverse a simple slice', () => {
    const res = new RunResults();
    res.push({ ID: '1' });
    res.push({ ID: '2' });
    res.push({ ID: '3' });
    res.push({ ID: '4' });
    res.push({ ID: '5' });

    const want = new RunResults();
    want.push({ ID: '5' });
    want.push({ ID: '4' });
    want.push({ ID: '3' });
    want.push({ ID: '2' });
    want.push({ ID: '1' });

    const got = res.reverse();
    expect(got).to.deep.equal(want);
  });
});
```

You'll need to create a separate file for the `RunResult` type:

```typescript
// RunResult.ts
export interface RunResult {
  ID: string;
}
```