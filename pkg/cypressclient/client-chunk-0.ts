```typescript
import axios from 'axios';

interface StatsFromCypressDashboard {
  data: {
    project: {
      id: string;
      name: string;
      isUsingRetries: boolean;
      shouldUpdateCypressVersion5: boolean;
      runs: Runs;
    };
  };
  errors: Array<{
    message: string;
  }>;
}

interface Runs {
  totalCount: number;
  nodes: RunResults;
}

type RunResults = Array<RunResult>;

interface RunResult {
  id: string;
  status: string;
  buildNumber: number;
  totalPassed: number;
  totalFailed: number;
  totalPending: number;
  totalSkipped: number;
  totalMutedTests: number;
  startTime: Date;
  totalDuration: number;
  scheduledToCompleteAt: Date;
  parallelizationDisabled: boolean;
  cancelledAt: any;
  totalFlakyTests: number;
  project: {
    id: string;
  };
  ci: {
    provider: string;
    ciBuildNumberFormatted: string;
  };
  commit: {
    branch: string;
    authorEmail: string;
    typename: string;
  };
  testResults: {
    totalCount: number;
    nodes: Array<TestResult>;
  };
}

interface TestResult {
  id: string;
  titleParts: Array<string>;
  isFlaky: boolean;
  isMuted: boolean;
  state: string;
  duration: number;
  instance: {
    id: string;
    status: string;
    duration: number;
    completedAt: Date;
    os: {
      name: string;
      version: string;
    };
    browser: {
      name: string;
      version: string;
    };
    group: {
      id: string;
      name: string;
    };
    spec: {
      id: string;
      shortPath: string;
    };
  };
}

class CypressDashboardMetricsClient {
  httpClient: any;
  endpoint: URL;
  email: string;
  password: string;
  authenticationToken: string;

  constructor(endpoint: URL, email: string, password: string) {
    this.httpClient = axios.create({
      baseURL: endpoint.toString(),
      timeout: 20 * 1000,
    });
    this.endpoint = endpoint;
    this.email = email;
    this.password = password;
    this.authenticationToken = '';
  }

  async authenticate(): Promise<void> {
    const body = {
      email: this.email,
      password: this.password,
    };

    const response = await axios.post('https://authenticate.cypress.io/login/local?source=dashboard', body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const cookie = response.headers['set-cookie'];
    const token = cookie.split(';')[0].replace('cy_dashboard=', '');

    this.authenticationToken = token;
  }
}

interface GetMetricOptions {
  from?: Date;
  to?: Date;
  size?: number;
  project: string;
}
```
```