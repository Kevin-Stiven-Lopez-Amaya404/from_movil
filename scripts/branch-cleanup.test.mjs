import assert from "node:assert/strict";
import test from "node:test";
import {parseBranches, reasonToPreserve} from "./branch-cleanup.mjs";

test("explicit branches only", () => {
  assert.deepEqual(parseBranches("04-dev, fix/ui-login-animation"), ["04-dev","fix/ui-login-animation"]);
  assert.throws(() => parseBranches(""));
  assert.throws(() => parseBranches("fix/x fix/x"));
  assert.throws(() => parseBranches("04-dev,dev"));
  assert.throws(() => parseBranches("feature/*"));
  assert.throws(() => parseBranches("--delete"));
  assert.throws(() => parseBranches("a..b"));
});

test("preserve branches with commits not merged", () => {
  assert.match(reasonToPreserve({branch:"03-dev",ahead:6,openPullRequests:0,protectedBranch:false}),/exclusive/);
});

test("preserve a branch tied to open pull request", () => {
  assert.match(reasonToPreserve({branch:"feature/mobile-production-qa",ahead:0,openPullRequests:1,protectedBranch:false}),/open PR/);
});

test("preserve protected, default and uncertain branches", () => {
  assert.ok(reasonToPreserve({branch:"dev",ahead:0,openPullRequests:0,protectedBranch:false}));
  assert.ok(reasonToPreserve({branch:"a",ahead:0,openPullRequests:0,protectedBranch:true}));
  assert.ok(reasonToPreserve({branch:"a",ahead:undefined,openPullRequests:0,protectedBranch:false}));
});

test("only merged unprotected branches with no open PRs qualify", () => {
  assert.equal(reasonToPreserve({branch:"04-dev",ahead:0,openPullRequests:0,protectedBranch:false}),null);
});
