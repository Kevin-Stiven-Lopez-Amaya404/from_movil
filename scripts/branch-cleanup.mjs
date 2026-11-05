import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

export function parseBranches(raw) {
  const items = String(raw ?? "").split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);
  if (!items.length || items.length > 20) throw new Error("Specify 1 to 20 explicit branch names.");
  if (new Set(items).size !== items.length) throw new Error("Repeated branch name.");
  for (const branch of items) {
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._\/-]*$/.test(branch)
      || branch.includes("..") || branch.includes("//")
      || branch.endsWith("/") || branch.endsWith(".lock")
      || ["dev","main","master","HEAD"].includes(branch)) {
      throw new Error("Unsafe or protected input branch: " + branch);
    }
  }
  return items;
}

export function reasonToPreserve({branch, protectedBranch, ahead, openPullRequests, matchesMainRef}) {
  if (["dev","main","master","HEAD"].includes(branch)) return "base branch";
  if (protectedBranch) return "GitHub protected branch";
  if (matchesMainRef) return "current default branch";
  if (!Number.isInteger(ahead) || ahead !== 0) return "has exclusive commits or uncertain comparison";
  if (!Number.isInteger(openPullRequests) || openPullRequests !== 0) return "open PR or uncertain PR check";
  return null;
}

const fileIsMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (fileIsMain) {
  const { GITHUB_REPOSITORY, GITHUB_TOKEN, BRANCHES, DRY_RUN, CONFIRMATION, GITHUB_REF_NAME } = process.env;
  if (!GITHUB_REPOSITORY || !GITHUB_TOKEN) throw new Error("Must run in authenticated GitHub Actions.");
  if (GITHUB_REF_NAME !== "dev") throw new Error("Run this workflow only from the dev branch.");
  const dryRun = DRY_RUN !== "false";
  if (!dryRun && CONFIRMATION !== "DELETE SAFE BRANCHES") {
    throw new Error("For deletions, confirm exact phrase DELETE SAFE BRANCHES.");
  }
  const names = parseBranches(BRANCHES);
  const [owner, repo] = GITHUB_REPOSITORY.split("/");
  async function api(url) {
    const response = await fetch("https://api.github.com" + url, {
      headers: {
        Authorization: "Bearer " + GITHUB_TOKEN,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!response.ok) throw new Error("GitHub API failed: " + response.status + " " + url);
    return response.json();
  }
  async function pullRequestsFor(branch) {
    let count = 0;
    for (let page = 1; page <= 10; page++) {
      const rows = await api("/repos/" + owner + "/" + repo + "/pulls?state=open&per_page=100&page=" + page);
      count += rows.filter((pr) => pr.head?.ref === branch && pr.head?.repo?.full_name === GITHUB_REPOSITORY).length;
      if (rows.length < 100) return count;
    }
    throw new Error("Open PR pagination exceeded safe limit");
  }
  const results = [];
  for (const branch of names) {
    const info = await api("/repos/" + owner + "/" + repo + "/branches/" + encodeURIComponent(branch));
    const comparison = await api("/repos/" + owner + "/" + repo + "/compare/dev..." + encodeURIComponent(branch));
    const openPullRequests = await pullRequestsFor(branch);
    const reason = reasonToPreserve({
      branch,
      protectedBranch: info.protected === true,
      matchesMainRef: branch === "dev",
      ahead: comparison.ahead_by,
      openPullRequests,
    });
    let result;
    if (reason) result = "PRESERVED: " + reason;
    else if (dryRun) result = "DRY RUN: eligible, not deleted";
    else {
      // Atomic lease: only delete if the remote ref still equals its inspected SHA.
      execFileSync("git", [
        "push", "--force-with-lease=refs/heads/" + branch + ":" + info.commit.sha,
        "origin", ":refs/heads/" + branch,
      ], {stdio: "inherit"});
      result = "DELETED (verified fast-forward into dev, no open PR, unprotected, SHA lease)";
    }
    results.push({branch, ahead: comparison.ahead_by, behind: comparison.behind_by,
      openPullRequests, protected: info.protected === true, result});
    console.log(JSON.stringify(results[results.length - 1]));
  }
  const markdown = [
    "# Branch cleanup report",
    "",
    "Mode: **" + (dryRun ? "DRY RUN" : "EXPLICIT DELETE") + "**",
    "",
    "| Branch | Ahead | Behind | Open PRs | Result |",
    "| --- | ---: | ---: | ---: | --- |",
    ...results.map((r) => "| `" + r.branch + "` | " + r.ahead + " | " + r.behind + " | " + r.openPullRequests + " | " + r.result + " |"),
    "",
  ].join("\n");
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
}
