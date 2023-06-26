import axios from "axios";

type ProjectID = string;
type Input = {
  page: number;
  timeRange: {
    startDate: string;
    endDate: string;
  };
  perPage: number;
};

type GraphqlQuery = {
  operationName: string;
  query: string;
  variables: { [key: string]: any };
};

const cypressDateFormat = "YYYY-MM-DD";

function createMetricRequest(
  projectID: string,
  from: Date,
  to: Date,
  size: number
): { query: string; variables: { [key: string]: any } } {
  const graphql = `query RunsList($projectId: String!, $input: ProjectRunsConnectionInput) {
    project(id: $projectId) {
      id
      name
      ...FlakyRateEmptyStateProject

      runs(input: $input) {
        totalCount
        nodes {
          id
          ...RunsListItem
        }
      }
    }
  }

  fragment FlakyRateEmptyStateProject on Project {
    id
    isUsingRetries
    shouldUpdateCypressVersion5
  }

  fragment RunsListItem on Run {
    id
    status
    buildNumber

    totalPassed
    totalFailed
    totalPending
    totalSkipped
    totalMutedTests
    startTime
    totalDuration
    scheduledToCompleteAt
    parallelizationDisabled
    cancelledAt
    totalFlakyTests
    project {
      id
    }
    ci {
      provider
      ciBuildNumberFormatted
    }

    commit {
      branch
      authorEmail
    }

    testResults(input: { perPage: 500 }) {
      totalCount
      nodes {
        id
        ...TestOverview
      }
    }
  }

  fragment TestOverview on TestResult {
    id
    titleParts
    isFlaky
    isMuted
    state
    duration
    instance {
      id
      ...DrawerRunInstance
      spec {
        id
        shortPath
      }
    }
  }

  fragment DrawerRunInstance on RunInstance {
    id
    status
    duration
    completedAt
    group {
        id    
        name
    }
    os {
      ...SpecOs
    }
    browser {
      ...SpecBrowser
    }
  }

  fragment SpecOs on OperatingSystem {
    name
    version
  }

  fragment SpecBrowser on BrowserInfo {
    name
    version
  }`;

  const variables: Input = {
    page: 1,
    timeRange: {
      startDate: from.toISOString().split("T")[0],
      endDate: to.toISOString().split("T")[0],
    },
    perPage: size,
  };

  const query: GraphqlQuery = {
    operationName: "RunsList",
    query: graphql,
    variables: {
      projectId: projectID,
      input: variables,
    },
  };

  return query;
}

export { createMetricRequest };