import { prometheus } from "prom-client";
import { Converter } from "./converter";
import * as log from "winston";

interface Key {
  prom: prometheus.Metric;
  hash: number;
}

interface Value {
  value: number;
  labels: string[];
  updatedAt: Date;
}

class KeyNotFoundError extends Error {
  constructor(k: Key) {
    super(`Cannot find the key ${JSON.stringify(k)}`);
  }
}

interface MetricMap {
  add(prom: prometheus.Metric, value: any, ...labels: string[]): void;
  get(k: Key): Value | null;
  map(): Map<Key, Value>;
  freeOldItems(): void;
}

class MetricMapKeepFirst implements MetricMap {
  private metrics: Map<Key, Value>;
  private keepUntil: number;

  constructor(keepUntil: number) {
    this.metrics = new Map<Key, Value>();
    this.keepUntil = keepUntil;
  }

  add(prom: prometheus.Metric, value: any, ...labels: string[]): void {
    const labelsHash = stringSliceHash(labels);
    const v = Converter.convertValueForPrometheus(value);
    if (v === null) {
      log.error(`Can't convert metric ${prom.name} type ${typeof value} to number`);
      return;
    }
    const key: Key = {
      prom,
      hash: labelsHash,
    };
    this.metrics.set(key, { value: v, labels, updatedAt: new Date() });
  }

  get(k: Key): Value | null {
    return this.metrics.get(k) || null;
  }

  map(): Map<Key, Value> {
    this.freeOldItems();
    return this.metrics;
  }

  freeOldItems(): void {
    const now = new Date();
    for (const [k, v] of this.metrics) {
      if (v.updatedAt.getTime() + this.keepUntil < now.getTime()) {
        log.debug(`Removing entry from map ${JSON.stringify(k)} : ${JSON.stringify(v)}`);
        this.metrics.delete(k);
      }
    }
  }
}

class MetricMapSumValues implements MetricMap {
  private metrics: Map<Key, Value>;
  private keepUntil: number;

  constructor(keepUntil: number) {
    this.metrics = new Map<Key, Value>();
    this.keepUntil = keepUntil;
  }

  add(prom: prometheus.Metric, value: any, ...labels: string[]): void {
    const labelsHash = stringSliceHash(labels);
    const v = Converter.convertValueForPrometheus(value);
    if (v === null) {
      log.error(`Can't convert metric ${prom.name} type ${typeof value} to number`);
      return;
    }
    const key: Key = {
      prom,
      hash: labelsHash,
    };
    const currentValue = this.metrics.get(key);
    if (currentValue) {
      this.metrics.set(key, { value: currentValue.value + v, labels, updatedAt: new Date() });
    } else {
      this.metrics.set(key, { value: v, labels, updatedAt: new Date() });
    }
  }

  get(k: Key): Value | null {
    return this.metrics.get(k) || null;
  }

  map(): Map<Key, Value> {
    this.freeOldItems();
    return this.metrics;
  }

  freeOldItems(): void {
    const now = new Date();
    for (const [k, v] of this.metrics) {
      if (v.updatedAt.getTime() + this.keepUntil < now.getTime()) {
        log.debug(`Removing entry from map ${JSON.stringify(k)} : ${JSON.stringify(v)}`);
        this.metrics.delete(k);
      }
    }
  }
}

function stringSliceHash(arr: string[]): number {
  let hash = 0;
  for (const str of arr) {
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
  }
  return hash;
}

export { MetricMap, MetricMapKeepFirst, MetricMapSumValues, Key, Value };