type AsyncLock = { current: boolean };

/** Runs a sensitive async action only once until its current request settles. */
export async function runSingleFlight(
  lock: AsyncLock,
  action: () => Promise<void>,
): Promise<boolean> {
  if (lock.current) return false;

  lock.current = true;

  try {
    await action();
    return true;
  } finally {
    lock.current = false;
  }
}
