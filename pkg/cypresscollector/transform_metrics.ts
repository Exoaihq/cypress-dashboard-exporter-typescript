```typescript
type MetricTransformer = (value: number) => number;

const noopTransformer: MetricTransformer = (value: number): number => {
  return value;
};

const msToSec: MetricTransformer = (value: number): number => {
  return value / 1000;
};

const promValueFromState = (value: string, expected: string): number => {
  if (value === expected) {
    return 1.0;
  } else {
    return 0.0;
  }
};
```