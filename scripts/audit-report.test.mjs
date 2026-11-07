import assert from "node:assert/strict";
import test from "node:test";
import { summarizeAudit } from "./audit-report.mjs";

const empty = () => ({
  metadata: { vulnerabilities: { critical: 0, high: 0, moderate: 0, low: 0, info: 0 } },
  vulnerabilities: {},
});

test("accepts a verified clean production dependency lockfile", () => {
  const result = summarizeAudit(empty(), 0);
  assert.equal(result.pass, true);
  assert.deepEqual(result.affected, []);
  assert.match(result.summary, /PASS/);
});

test("retains all severity counts and identifies high-risk packages", () => {
  const report = empty();
  report.metadata.vulnerabilities.high = 2;
  report.metadata.vulnerabilities.moderate = 7;
  report.vulnerabilities["example-dependency"] = { severity: "high" };
  const result = summarizeAudit(report, 1);
  assert.equal(result.pass, false);
  assert.deepEqual(result.affected, ["example-dependency"]);
  assert.match(result.summary, /\| moderate \| 7 \|/);
});

test("fails closed for npm registry and JSON errors", () => {
  assert.throws(() => summarizeAudit({ error: { code: "ENOTFOUND" } }, 1), /invalid or unavailable/);
  assert.throws(() => summarizeAudit({ metadata: {}, vulnerabilities: {} }, 1), /invalid or unavailable/);
  assert.throws(() => summarizeAudit(empty(), 2), /invalid or unavailable/);
});

test("does not accidentally approve an inconsistent exit status", () => {
  const report = empty();
  report.metadata.vulnerabilities.critical = 1;
  assert.throws(() => summarizeAudit(report, 0), /unexpectedly exited successfully/);
  assert.throws(() => summarizeAudit(empty(), 1), /reported no high/);
});

test("requires complete and non-negative severity counts", () => {
  const report = empty();
  delete report.metadata.vulnerabilities.high;
  assert.throws(() => summarizeAudit(report, 0), /omitted the severity count/);
  report.metadata.vulnerabilities.high = -1;
  assert.throws(() => summarizeAudit(report, 0), /omitted the severity count/);
});
