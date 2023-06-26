import * as flag from 'commander';
import * as http from 'http';
import * as url from 'url';
import * as logrus from 'logrus';
import { CypressDashboardCollector } from './cypresscollector';
import { RequestHandler } from 'express';
import { register, collectDefaultMetrics } from 'prom-client';
import { Server } from 'http';

const readinessTime = 360;

const loggingMiddleware: RequestHandler = (req, res, next) => {
  logrus.info('%v ');
  next();
};

function initCollector(
  u: url.UrlWithStringQuery,
  project: string,
  email: string,
  password: string,
  keepUntil: number
): CypressDashboardCollector {
  const cypressCollector = new CypressDashboardCollector(u, project, email, password, keepUntil);
  return cypressCollector;
}

function toSeconds(days: number): number {
  return days * 24 * 60 * 60;
}

async function main() {
  flag
    .option('-l, --listen <listen>', 'host:port to listen', '0.0.0.0:8081')
    .option('-p, --project <project>', 'host:port to listen', '7s5okt')
    .option('-k, --keepUntil <keepUntil>', 'Time ( in days ) to keep in memory the results of a test/run before removing it.', 14)
    .option('-e, --email <email>', 'email to connect to the dashboard')
    .option('-P, --password <password>', 'password to connect to the dashboard')
    .option('-d, --debug', 'activate debug logging', false)
    .parse(process.argv);

  if (flag.debug) {
    logrus.setLevel(logrus.LOG_LEVELS.debug);
  }

  logrus.info('Starting Cypress dashboard exporter');
  const parsedURL = url.parse('https://dashboard.cypress.io/graphql');

  const ddCollector = initCollector(parsedURL, flag.project, flag.email, flag.password, toSeconds(flag.keepUntil));
  logrus.info(`Monitoring Cypress dashboard at ${parsedURL} for project ID ${flag.project}`);
  logrus.info(`Keeping old timeseries for ${flag.keepUntil} days`);

  register.registerCollector(ddCollector);
  collectDefaultMetrics();

  const server: Server = http.createServer((req, res) => {
    if (req.url === '/metrics') {
      res.setHeader('Content-Type', register.contentType);
      res.end(register.metrics());
    } else {
      res.statusCode = 404;
      res.end();
    }
  });

  logrus.info(`Listening ${flag.listen}`);
  server.listen(flag.listen);
}

main().catch((error) => {
  logrus.error(error);
  process.exit(1);
});