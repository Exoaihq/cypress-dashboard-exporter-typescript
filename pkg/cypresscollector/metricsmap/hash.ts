```typescript
import * as fmt from "fmt";

type LabelsHash = string;

function stringSliceHash(s: string[]): LabelsHash {
  let toHash = "";
  const separator = "___";

  for (const i of s) {
    toHash = `${i}${separator}${toHash}`;
  }
  return toHash as LabelsHash;
}
```