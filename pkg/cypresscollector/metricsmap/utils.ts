import { MetricMap } from "./MetricMap";
import { Desc } from "prom-client";

type AddFunction = (k: Desc, v: any, ...labels: string[]) => void;

export function multipleAdd(...ms: MetricMap[]): AddFunction {
  return (k: Desc, v: any, ...labels: string[]): void => {
    for (const m of ms) {
      m.add(k, v, ...labels);
    }
  };
}