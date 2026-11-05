import assert from "node:assert/strict";
import test from "node:test";
import { promotionDecision } from "./release-promotion-policy.mjs";

const repository = "Kevin-Stiven-Lopez-Amaya404/from_movil";
const allowed = (base, head, headRepository = repository) =>
  promotionDecision({ base, head, headRepository, repository });

test("dev -> qa is the only authorized QA promotion", () => {
  assert.equal(allowed("qa", "dev").ok, true);
  assert.equal(allowed("qa", "feature/new-ui").ok, false);
  assert.equal(allowed("qa", "main").ok, false);
});

test("qa -> main is the only authorized main promotion", () => {
  assert.equal(allowed("main", "qa").ok, true);
  assert.equal(allowed("main", "dev").ok, false);
  assert.equal(allowed("main", "feature/new-ui").ok, false);
});

test("same-repository source and all required inputs are enforced", () => {
  assert.equal(allowed("main", "qa", "someone/fork").ok, false);
  assert.equal(allowed("main", "qa", "").ok, false);
  assert.equal(allowed("qa", "dev").reason, "Allowed promotion: dev to qa.");
  assert.equal(allowed("qa", "").ok, false);
});
