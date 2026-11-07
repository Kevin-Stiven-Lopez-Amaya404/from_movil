const assert = require("node:assert/strict");
const { existsSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const { resolveAuthRedirect } = require("../lib/navigation/auth-route-policy");

const ready = {
  isLoading: false,
  splashDone: true,
};

test("keeps a single root index route in the main tab group", () => {
  const appRoot = path.resolve(__dirname, "../app");

  assert.equal(existsSync(path.join(appRoot, "index.tsx")), false);
  assert.equal(
    existsSync(path.join(appRoot, "(tabs)", "(main)", "index.tsx")),
    true,
  );
});

test("does not redirect before splash and session restoration finish", () => {
  assert.equal(
    resolveAuthRedirect({
      ...ready,
      firstSegment: "(tabs)",
      isAuthenticated: false,
      isLoading: true,
    }),
    null,
  );
  assert.equal(
    resolveAuthRedirect({
      ...ready,
      firstSegment: "(tabs)",
      isAuthenticated: false,
      splashDone: false,
    }),
    null,
  );
});

test("sends unauthenticated users away from protected tab routes", () => {
  assert.equal(
    resolveAuthRedirect({
      ...ready,
      firstSegment: "(tabs)",
      isAuthenticated: false,
    }),
    "/welcome",
  );
});

test("keeps authenticated users on the main tab route", () => {
  assert.equal(
    resolveAuthRedirect({
      ...ready,
      firstSegment: "(tabs)",
      isAuthenticated: true,
    }),
    null,
  );
});

test("sends authenticated users away from public auth screens", () => {
  assert.equal(
    resolveAuthRedirect({
      ...ready,
      firstSegment: "login",
      isAuthenticated: true,
    }),
    "/(tabs)/(main)/index",
  );
});

test("preserves token-based auth screens for authenticated sessions", () => {
  for (const firstSegment of [
    "new-password",
    "reset-password",
    "activate-account",
    "reactivate-account",
  ]) {
    assert.equal(
      resolveAuthRedirect({ ...ready, firstSegment, isAuthenticated: true }),
      null,
    );
  }
});
