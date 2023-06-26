```typescript
import { Type } from 'reflect-metadata';

export function convertValueForPrometheus(value: any): [number, Error | null] {
  let prometheusValue: number;

  switch (typeof value) {
    case 'number':
      prometheusValue = value;
      break;
    case 'boolean':
      prometheusValue = value ? 1.0 : 0.0;
      break;
    case 'object':
      if (value instanceof Date) {
        prometheusValue = value.getTime() / 1000;
      } else {
        return [0.0, new Error(`Conversion from type ${typeof value} to float (Prometheus standard) unknown`)];
      }
      break;
    default:
      return [0.0, new Error(`Conversion from type ${typeof value} to float (Prometheus standard) unknown`)];
  }
  return [prometheusValue, null];
}

export function stateToValue(state: string): number {
  if (state === 'PASSED') {
    return 1.0;
  }
  return 0.0;
}
```