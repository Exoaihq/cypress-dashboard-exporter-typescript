import { Logger } from 'winston';
import { CypressDashboardExporter } from './CypressDashboardExporter';
import { CypressClient, AllValidState } from './CypressClient';
import { Metrics, RunInstance, TestInstance, TestContext } from './Metrics';
import { evaluateLabels, RunsOrderedLabels, RunInstanceOrderedLabels, TestInstanceOrderedLabels, TestResultInstanceOrderedLabels } from './Labels';

const logger = Logger.createLogger();

function invalidMetric(available: boolean, err: Error): void {
  if (!available) {
    logger.error('Cypress Dashboard Exporter is not available', err);
  }
}

function maybeMetric(ch: any, metric: any, value: number, transformer: any, labels: any[]): void {
  if (ch) {
    ch.add(metric, value, transformer, ...labels);
  }
}

function promValueFromState(state: string, value: string): number {
  return state === value ? 1.0 : 0.0;
}

const c = new CypressDashboardExporter();

if (!c.CypressDashboardExporterAvailable) {
  invalidMetric(c.CypressDashboardExporterAvailable, new Error('Cypress Dashboard Exporter is not available'));
  return;
}

const metrics = new Metrics();
maybeMetric(ch, c.CypressRunsCount, prometheus.GaugeValue, metrics.Data.Project.Runs.TotalCount, noopTransformer, evaluateLabels(RunsOrderedLabels, metrics, null));

for (const runInstance of metrics.Data.Project.Runs.Nodes.reverse()) {
  logger.info(`Processing build ${runInstance.BuildNumber} started at ${runInstance.StartTime} in state ${runInstance.Status}`);
  if (c.AlreadyProcessedBuilds.has(runInstance.BuildNumber)) {
    logger.info('Already processed build id', runInstance.BuildNumber);
  } else if (runInstance.Status === 'PASSED' || runInstance.Status === 'FAILED') {
    logger.info('Processing build id', runInstance.BuildNumber);

    c.runLatest.add(c.CypressRunPassed, runInstance.TotalPassed, evaluateLabels(RunInstanceOrderedLabels, metrics, runInstance));
    c.runLatest.add(c.CypressRunPending, runInstance.TotalPending, evaluateLabels(RunInstanceOrderedLabels, metrics, runInstance));
    c.runLatest.add(c.CypressRunFailed, runInstance.TotalFailed, evaluateLabels(RunInstanceOrderedLabels, metrics, runInstance));
    c.runLatest.add(c.CypressRunMutedTests, runInstance.TotalMutedTests, evaluateLabels(RunInstanceOrderedLabels, metrics, runInstance));
    c.runLatest.add(c.CypressRunSkipped, runInstance.TotalSkipped, evaluateLabels(RunInstanceOrderedLabels, metrics, runInstance));
    c.runLatest.add(c.CypressRunFlakyTests, runInstance.TotalFlakyTests, evaluateLabels(RunInstanceOrderedLabels, metrics, runInstance));
    c.runLatest.add(c.CypressRunDuration, runInstance.TotalDuration, evaluateLabels(RunInstanceOrderedLabels, metrics, runInstance));
    c.runLatest.add(c.CypressRunStartTime, runInstance.StartTime, evaluateLabels(RunInstanceOrderedLabels, metrics, runInstance));

    c.runSummary.add(c.CypressRunPassedSum, runInstance.TotalPassed, evaluateLabels(RunInstanceOrderedLabels, metrics, runInstance));
    c.runSummary.add(c.CypressRunPendingSum, runInstance.TotalPending, evaluateLabels(RunInstanceOrderedLabels, metrics, runInstance));
    c.runSummary.add(c.CypressRunFailedSum, runInstance.TotalFailed, evaluateLabels(RunInstanceOrderedLabels, metrics, runInstance));
    c.runSummary.add(c.CypressRunMutedTestsSum, runInstance.TotalMutedTests, evaluateLabels(RunInstanceOrderedLabels, metrics, runInstance));
    c.runSummary.add(c.CypressRunSkippedSum, runInstance.TotalSkipped, evaluateLabels(RunInstanceOrderedLabels, metrics, runInstance));
    c.runSummary.add(c.CypressRunFlakyTestsSum, runInstance.TotalFlakyTests, evaluateLabels(RunInstanceOrderedLabels, metrics, runInstance));
    c.runSummary.add(c.CypressRunDurationSum, runInstance.TotalDuration, evaluateLabels(RunInstanceOrderedLabels, metrics, runInstance));
    c.runSummary.add(c.CypressRunStartTimeSum, runInstance.StartTime, evaluateLabels(RunInstanceOrderedLabels, metrics, runInstance));

    c.runSummary.add(c.CypressRunCount, 1.0, evaluateLabels(RunInstanceOrderedLabels, metrics, runInstance));

    c.AlreadyProcessedBuilds.add(runInstance.BuildNumber);

    for (const testInstance of runInstance.TestResults.Nodes) {
      const state = testInstance.State;

      c.testLatest.add(c.CypressTestDurationLast, testInstance.Duration, evaluateLabels(TestInstanceOrderedLabels, metrics, new TestContext(runInstance, testInstance)));

      let matched = false;
      for (const value of AllValidState()) {
        const s = promValueFromState(state, value.toString());
        if (s === 1.0) {
          matched = true;
        }
        c.testSummary.add(c.CypressTestStateSum, s, evaluateLabels(TestResultInstanceOrderedLabels(value.toString()), metrics, new TestContext(runInstance, testInstance)));
        c.testLatest.add(c.CypressTestStateLast, s, evaluateLabels(TestResultInstanceOrderedLabels(value.toString()), metrics, new TestContext(runInstance, testInstance)));
      }
      if (!matched) {
        logger.warn('Unknown state', state, ' while processing test', testInstance.TitleParts);
        c.testSummary.add(c.CypressTestStateSum, 1.0, evaluateLabels(TestResultInstanceOrderedLabels(CypressClient.Other.toString()), metrics, new TestContext(runInstance, testInstance)));
        c.testLatest.add(c.CypressTestStateLast, 1.0, evaluateLabels(TestResultInstanceOrderedLabels(CypressClient.Other.toString()), metrics, new TestContext(runInstance, testInstance)));
      } else {
        c.testSummary.add(c.CypressTestStateSum, 0.0, evaluateLabels(TestResultInstanceOrderedLabels(CypressClient.Other.toString()), metrics, new TestContext(runInstance, testInstance)));
        c.testLatest.add(c.CypressTestStateLast, 0.0, evaluateLabels(TestResultInstanceOrderedLabels(CypressClient.Other.toString()), metrics, new TestContext(runInstance, testInstance)));
      }

      c.testSummary.add(c.CypressTestDurationSum, testInstance.Duration, evaluateLabels(TestInstanceOrderedLabels, metrics, new TestContext(runInstance, testInstance)));
    }
  }
}