import { fileURLToPath } from "node:url";

export function promotionDecision({ base, head, repository, headRepository }) {
  if (!repository || !headRepository || headRepository !== repository) {
    return { ok: false, reason: "Release PR must originate in the same repository." };
  }
  if (base === "qa" && head === "dev") {
    return { ok: true, reason: "Allowed promotion: dev to qa." };
  }
  if (base === "main" && head === "qa") {
    return { ok: true, reason: "Allowed promotion: qa to main." };
  }
  return {
    ok: false,
    reason: `Forbidden promotion from ${head || "(missing)"} to ${base || "(missing)"}. Only dev -> qa and qa -> main are allowed.`,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = promotionDecision({
    base: process.env.PR_BASE,
    head: process.env.PR_HEAD,
    repository: process.env.GITHUB_REPOSITORY,
    headRepository: process.env.PR_HEAD_REPOSITORY,
  });
  console.log(result.reason);
  if (!result.ok) process.exitCode = 1;
}
