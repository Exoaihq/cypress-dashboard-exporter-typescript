import { TestResultInstanceOrderedLabels, TestInstanceOrderedLabels, testContext, evaluateLabels, maybeMetric, noopTransformer } from './your_imports'; // Replace with actual imports
import { Logger } from 'winston';
import { Counter, Gauge, Prometheus } from 'prom-client'; // Replace with actual imports

class CypressClient {
  runLatest: Map<any, any>;
  runSummary: Map<any, any>;
  testLatest: Map<any, any>;
  testSummary: Map<any, any>;
  CypressTestDurationSum: Counter;
  CypressTestCount: Counter;

  constructor() {
    // Initialize your class properties here
  }

  processRunsAndTests(ch: any, runInstance: any, testInstance: any, metrics: any) {
    if (runInstance.State === 'FINISHED') {
      if (testInstance.State === 'PASSED' || testInstance.State === 'FAILED') {
        this.testLatest.Set(testInstance.Duration, evaluateLabels(TestResultInstanceOrderedLabels(cypressclient.Other.String()), metrics, testContext(runInstance, testInstance)));
        this.testSummary.Add(this.CypressTestDurationSum, testInstance.Duration, evaluateLabels(TestInstanceOrderedLabels, metrics, testContext(runInstance, testInstance)));
        this.testSummary.Add(this.CypressTestCount, 1.0, evaluateLabels(TestInstanceOrderedLabels, metrics, testContext(runInstance, testInstance)));
      }
      Logger.debug(`Map of tests and runs : ${this.runLatest}, ${this.runSummary}, ${this.testLatest}, ${this.testSummary}`);

    } else {
      Logger.info(`Run ${runInstance.BuildNumber} is in state ${runInstance.State}, skipping for now...`);
    }

    for (const [key, value] of this.runSummary) {
      Logger.debug(`Processing summary ( counters ) ${key.Prom.String()}`);
      maybeMetric(ch, key.Prom, Prometheus.CounterValue, value.Value, noopTransformer, value.Labels);
    }
    for (const [key, value] of this.runLatest) {
      Logger.debug(`Processing latests ( gauge ) ${key.Prom.String()}`);
      maybeMetric(ch, key.Prom, Prometheus.GaugeValue, value.Value, noopTransformer, value.Labels);
    }

    for (const [key, value] of this.testSummary) {
      Logger.debug(`Processing tests summary ( counters ) ${key.Prom.String()}`);
      maybeMetric(ch, key.Prom, Prometheus.CounterValue, value.Value, noopTransformer, value.Labels);
    }
    for (const [key, value] of this.testLatest) {
      Logger.debug(`Processing test latests ( gauge ) ${key.Prom.String()}`);
      maybeMetric(ch, key.Prom, Prometheus.GaugeValue, value.Value, noopTransformer, value.Labels);
    }
  }
}

export default CypressClient;