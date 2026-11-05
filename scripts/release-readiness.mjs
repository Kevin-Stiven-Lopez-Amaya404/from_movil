import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

export const requiredIssueNumbers = [42, 52, 53];

export function evaluateReleaseIssues(issues) {
  const blockers = requiredIssueNumbers.filter((number) => issues.get(number) !== "closed");
  return { ready: blockers.length === 0, blockers };
}

export async function loadIssueStates({ repository, token, fetcher = fetch }) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository) || !token) {
    throw new Error("Release check is missing repository identity or GitHub credentials.");
  }
  const pairs = await Promise.all(requiredIssueNumbers.map(async (number) => {
    const response = await fetcher(
      "https://api.github.com/repos/" + repository + "/issues/" + number,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: "Bearer " + token,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
    if (!response.ok) {
      throw new Error("Unable to verify release issue #" + number + ": HTTP " + response.status);
    }
    const issue = await response.json();
    if (issue.number !== number || !["open", "closed"].includes(issue.state)) {
      throw new Error("Invalid state returned for release issue #" + number);
    }
    return [number, issue.state];
  }));
  return new Map(pairs);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const repository = process.env.GITHUB_REPOSITORY;
    const issues = await loadIssueStates({ repository, token: process.env.GH_TOKEN });
    const { ready, blockers } = evaluateReleaseIssues(issues);
    if (!ready) {
      console.error("RELEASE BLOCKED — pending acceptance or security issues:");
      for (const n of blockers) {
        console.error("- https://github.com/" + repository + "/issues/" + n);
      }
      console.error("Do not merge qa to main or publish production until resolved.");
      process.exitCode = 1;
    } else {
      console.log("Release issue gates cleared; CI does NOT replace human QA or GitHub branch protection.");
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Release verification failed.");
    process.exitCode = 1;
  }
}
