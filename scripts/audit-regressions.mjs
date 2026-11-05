import fs from "node:fs";
import { fileURLToPath } from "node:url";

const highSeverities = new Set(["high", "critical"]);

function findingKey(packageName, vulnerability, via) {
  const source =
    typeof via === "string"
      ? "dependency:" + via
      : via && typeof via === "object"
        ? via.url || (via.name || packageName) + ":" + (via.title || via.source || "advisory")
        : "unidentified-advisory";
  return packageName + "|" + vulnerability.severity + "|" + source;
}

export function highSeverityFindings(report) {
  if (!report || typeof report !== "object" || report.error ||
      !report.vulnerabilities || typeof report.vulnerabilities !== "object" ||
      Array.isArray(report.vulnerabilities)) {
    throw new Error("Missing or invalid npm audit vulnerability data (possible registry/network error)");
  }

  const results = new Map();
  for (const [packageName, vulnerability] of Object.entries(report.vulnerabilities)) {
    if (!vulnerability || !highSeverities.has(vulnerability.severity)) continue;
    const via = Array.isArray(vulnerability.via) && vulnerability.via.length
      ? vulnerability.via
      : [null];
    for (const path of via) {
      const key = findingKey(packageName, vulnerability, path);
      results.set(key, {
        package: packageName,
        severity: vulnerability.severity,
        advisory: typeof path === "object" && path?.url ? path.url : String(path ?? "unknown"),
      });
    }
  }
  return results;
}

export function compareAudits(base, head) {
  const before = highSeverityFindings(base);
  const after = highSeverityFindings(head);
  const introduced = [...after].filter(([key]) => !before.has(key)).map(([, value]) => value);
  return { previous: before.size, current: after.size, introduced };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    if (process.argv.length !== 4) {
      throw new Error("Usage: node scripts/audit-regressions.mjs base-audit.json head-audit.json");
    }
    const base = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
    const head = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));
    const result = compareAudits(base, head);
    console.log(JSON.stringify(result, null, 2));
    if (result.introduced.length) {
      console.error("Security regression: " + result.introduced.length + " new high/critical finding(s).");
      process.exitCode = 1;
    } else {
      console.log("No newly introduced high/critical findings relative to PR base.");
    }
  } catch (error) {
    console.error("Security comparison unavailable: " + error.message);
    process.exitCode = 2;
  }
}
