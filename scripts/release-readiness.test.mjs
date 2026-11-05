import assert from "node:assert/strict";
import test from "node:test";
import { evaluateReleaseIssues, loadIssueStates, requiredIssueNumbers } from "./release-readiness.mjs";

test("production remains blocked until all release issues are closed", () => {
  assert.deepEqual(requiredIssueNumbers, [42, 52, 53]);
  assert.deepEqual(evaluateReleaseIssues(new Map([[42, "closed"], [52, "open"], [53, "open"]])),
    { ready: false, blockers: [52, 53] });
  assert.deepEqual(evaluateReleaseIssues(new Map([[42, "closed"], [52, "closed"], [53, "closed"]])),
    { ready: true, blockers: [] });
});

test("missing issue verification fails closed", () => {
  assert.deepEqual(evaluateReleaseIssues(new Map()), {
    ready: false, blockers: [42, 52, 53],
  });
});

test("loads required issue state through the GitHub API", async () => {
  const visited = [];
  const states = await loadIssueStates({
    repository: "owner/from_movil",
    token: "test-token",
    fetcher: async (url, options) => {
      visited.push({ url, auth: options.headers.Authorization });
      const number = Number(url.split("/").at(-1));
      return { ok: true, json: async () => ({ number, state: number === 53 ? "open" : "closed" }) };
    },
  });
  assert.deepEqual(evaluateReleaseIssues(states), { ready: false, blockers: [53] });
  assert.equal(visited.length, 3);
  assert.ok(visited.every((x) => x.auth === "Bearer test-token"));
});

test("does not accept API errors or invalid issue responses as approvals", async () => {
  await assert.rejects(loadIssueStates({
    repository: "owner/from_movil",
    token: "test-token",
    fetcher: async () => ({ ok: false, status: 403 }),
  }), /Unable to verify/);
  await assert.rejects(loadIssueStates({
    repository: "owner/from_movil",
    token: "test-token",
    fetcher: async () => ({ ok: true, json: async () => ({ number: 42, state: "closed" }) }),
  }), /Invalid state/);
});
