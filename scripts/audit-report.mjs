import { readFileSync, appendFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const severities = ["critical", "high", "moderate", "low", "info"];

export function summarizeAudit(report, exitCode) {
  if (!report || typeof report !== "object" || Array.isArray(report) ||
      report.error || !report.metadata || !report.metadata.vulnerabilities ||
      !report.vulnerabilities || typeof report.vulnerabilities !== "object" ||
      ![0, 1].includes(exitCode)) {
    throw new Error("npm audit returned an invalid or unavailable report; failing closed.");
  }
  const counts = report.metadata.vulnerabilities;
  for (const severity of severities) {
    if (!Number.isSafeInteger(counts[severity]) || counts[severity] < 0) {
      throw new Error("npm audit omitted the severity count: " + severity);
    }
  }
  const affected = Object.entries(report.vulnerabilities)
    .filter(([, finding]) => finding && ["critical", "high"].includes(finding.severity))
    .map(([name]) => name)
    .sort();
  const blocking = counts.critical > 0 || counts.high > 0;
  if (blocking && exitCode === 0) {
    throw new Error("npm audit unexpectedly exited successfully with high/critical findings.");
  }
  if (!blocking && exitCode !== 0) {
    throw new Error("npm audit exited with an error but reported no high/critical findings.");
  }
  const lines = [
    "## npm audit – production dependency baseline",
    "",
    "Audited with \`npm audit --omit=dev --audit-level=high --json\`.",
    "",
    "| Severity | Count |",
    "| --- | ---: |",
    ...severities.map((severity) => "| " + severity + " | " + counts[severity] + " |"),
    "",
    blocking
      ? "**BLOCKED:** high/critical vulnerabilities remain; review issue #42 before approving production."
      : "**PASS:** no high/critical npm audit findings in the current lockfile.",
    "",
    affected.length ? "Affected package entries: " + affected.map((name) => "\`" + name.replaceAll("\`", "") + "\`").join(", ") : "No high/critical package entries.",
    "",
    "Advisory data is based on npm's registry at execution time; this does not establish APK runtime reachability.",
  ];
  return { pass: !blocking, counts, affected, summary: lines.join("\n") + "\n" };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const path = process.argv[2];
    const exitCode = Number(process.env.AUDIT_EXIT_CODE);
    const report = JSON.parse(readFileSync(path, "utf8"));
    const result = summarizeAudit(report, exitCode);
    process.stdout.write(result.summary);
    if (process.env.GITHUB_STEP_SUMMARY) {
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, result.summary);
    }
    if (!result.pass) process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Unable to verify the audit.");
    process.exitCode = 1;
  }
}
