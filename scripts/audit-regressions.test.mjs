import assert from "node:assert/strict";
import test from "node:test";
import { compareAudits, highSeverityFindings } from "./audit-regressions.mjs";

const advisory = {name:"zod", title:"Resource exhaustion", url:"https://github.com/advisories/GHSA-example", severity:"high"};
const baseline = {vulnerabilities: {
  zod: {severity:"high", via:[advisory]},
  glob: {severity:"moderate", via:["minimatch"]},
}};

test("baseline vulnerabilities are not treated as introduced", () => {
  assert.deepEqual(compareAudits(baseline, structuredClone(baseline)).introduced, []);
});

test("new high-severity advisory fails the comparison", () => {
  const head = structuredClone(baseline);
  head.vulnerabilities.zod.via.push({name:"zod",severity:"high",url:"https://github.com/advisories/GHSA-new"});
  assert.equal(compareAudits(baseline, head).introduced.length, 1);
});

test("upgrading a vulnerability to high severity is detected", () => {
  const head = structuredClone(baseline);
  head.vulnerabilities.glob.severity = "high";
  assert.equal(compareAudits(baseline, head).introduced.length, 1);
});

test("moderate-only findings do not block", () => {
  const head = structuredClone(baseline);
  head.vulnerabilities.foobar = {severity:"moderate", via:["baz"]};
  assert.equal(compareAudits(baseline, head).introduced.length, 0);
});

test("findings without via still have a key", () => {
  const result = highSeverityFindings({vulnerabilities: {unknown:{severity:"high",via:[]}}});
  assert.equal(result.size, 1);
});

test("registry errors cannot masquerade as no vulnerabilities", () => {
  assert.throws(() => compareAudits({error:{code:"ENOTFOUND"}}, baseline));
  assert.throws(() => compareAudits(baseline, {vulnerabilities:null}));
});
