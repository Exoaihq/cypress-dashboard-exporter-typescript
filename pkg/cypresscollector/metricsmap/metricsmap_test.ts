```typescript
import { Key, Value } from './types';

class MetricMapSumValues {
  metrics: Map<Key, Value>;
  keepUntil: number;

  constructor(metrics: Map<Key, Value>, keepUntil: number) {
    this.metrics = metrics;
    this.keepUntil = keepUntil;
  }

  map(): Map<Key, Value> {
    const now = Date.now();
    const result = new Map<Key, Value>();

    for (const [key, value] of this.metrics.entries()) {
      if (now - value.timestamp <= this.keepUntil) {
        result.set(key, value);
      }
    }

    return result;
  }
}

// Test code
const now = Date.now();
const testCases = [
  {
    name: 'test old items',
    fields: {
      metrics: new Map<Key, Value>([
        [
          new Key(null, 'future'),
          new Value(0.0, [], now),
        ],
        [
          new Key(null, 'old'),
          new Value(0.0, [], now - 10 * 60 * 60 * 1000),
        ],
      ]),
      keepUntil: 2 * 60 * 60 * 1000,
    },
    want: new Map<Key, Value>([
      [
        new Key(null, 'future'),
        new Value(0.0, [], now),
      ],
    ]),
  },
];

for (const testCase of testCases) {
  const m = new MetricMapSumValues(testCase.fields.metrics, testCase.fields.keepUntil);
  const got = m.map();

  if (JSON.stringify(Array.from(got.entries())) !== JSON.stringify(Array.from(testCase.want.entries()))) {
    console.error(`MetricMapSumValues.Map() = ${JSON.stringify(Array.from(got.entries()))}, want ${JSON.stringify(Array.from(testCase.want.entries()))}`);
  }
}
```