import axios from 'axios';
import { DateTime } from 'luxon';

type OptionalTime = DateTime | null;
type OptionalInt = number | null;

interface GetMetricOptions {
  from: OptionalTime;
  to: OptionalTime;
  size: OptionalInt;
  project: string;
}

class CypressDashboardMetricsClient {
  private endpoint: string;
  private authenticationToken: string;
  private httpClient = axios.create();

  constructor(endpoint: string, authenticationToken: string) {
    this.endpoint = endpoint;
    this.authenticationToken = authenticationToken;
  }

  static emptyMetricOptions(): GetMetricOptions {
    const from = DateTime.fromObject({ year: 2006, month: 1, day: 1 });
    const to = DateTime.local();
    const defaultPaging = 3;
    return {
      from,
      to,
      size: defaultPaging,
      project: '7s5okt', // This is the realworld example from Cypress
    };
  }

  async getMetrics(opts: GetMetricOptions): Promise<StatsFromCypressDashboard> {
    const statsURL = this.endpoint;

    const createReq = async () => {
      const body = createMetricRequest(
        opts.project,
        opts.from || DateTime.fromObject({ year: 2006, month: 1, day: 1 }),
        opts.to || DateTime.local(),
        opts.size || defaultPaging
      );
      const headers = {
        cookie: `cy_dashboard=${this.authenticationToken}`,
        'content-type': 'application/json',
      };
      return this.httpClient.post(statsURL, body, { headers });
    };

    const getAnswer = async (req: Promise<any>) => {
      const resp = await req;
      const stats: StatsFromCypressDashboard = resp.data;
      return stats;
    };

    try {
      const req = createReq();
      const resp = await getAnswer(req);
      return resp;
    } catch (error) {
      console.warn(`error on first request, trying to authenticate. Error was : ${error}`);
      await this.authenticate();

      try {
        const req2 = createReq();
        const resp2 = await getAnswer(req2);
        return resp2;
      } catch (error2) {
        throw new Error(`Unrecoverable error occurred: ${error2}. Check your credentials and project ID.`);
      }
    }
  }

  async authenticate() {
    // Implement authentication logic here
  }
}

function createMetricRequest(project: string, from: DateTime, to: DateTime, size: number) {
  // Implement createMetricRequest logic here
}