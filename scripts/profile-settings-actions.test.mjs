import assert from "node:assert/strict";
import test from "node:test";

import { runSingleFlight } from "../lib/utils/async-action-lock.ts";

test("prevents concurrent duplicate account actions", async () => {
  const lock = { current: false };
  let releaseAction;
  let calls = 0;
  const pendingAction = new Promise((resolve) => {
    releaseAction = resolve;
  });

  const first = runSingleFlight(lock, async () => {
    calls += 1;
    await pendingAction;
  });
  const second = await runSingleFlight(lock, async () => {
    calls += 1;
  });

  assert.equal(second, false);
  assert.equal(calls, 1);

  releaseAction();
  assert.equal(await first, true);
  assert.equal(lock.current, false);
});

test("releases the action lock after a failed request", async () => {
  const lock = { current: false };

  await assert.rejects(
    runSingleFlight(lock, async () => {
      throw new Error("request failed");
    }),
    /request failed/,
  );

  assert.equal(lock.current, false);
  assert.equal(
    await runSingleFlight(lock, async () => {}),
    true,
  );
});
