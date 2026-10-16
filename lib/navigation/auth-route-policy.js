const PUBLIC_AUTH_SEGMENTS = new Set([
  "welcome",
  "login",
  "register",
  "forgot-password",
  "request-reactivation",
  "new-password",
  "reset-password",
  "activate-account",
  "reactivate-account",
]);

const TOKEN_AUTH_SEGMENTS = new Set([
  "new-password",
  "reset-password",
  "activate-account",
  "reactivate-account",
]);

/**
 * Returns the authentication redirect for the current route, if one is needed.
 *
 * The app's `/` route belongs to the main tabs index. Keeping a second root
 * `index` route would make the root redirect target resolve to the same URL.
 * @param {{ firstSegment?: string, isAuthenticated: boolean, isLoading: boolean, splashDone: boolean }} state
 * @returns {"/welcome" | "/(tabs)/(main)/index" | null}
 */
function resolveAuthRedirect({
  firstSegment,
  isAuthenticated,
  isLoading,
  splashDone,
}) {
  if (!splashDone || isLoading || !firstSegment) return null;

  if (!isAuthenticated && firstSegment === "(tabs)") {
    return "/welcome";
  }

  if (
    isAuthenticated &&
    PUBLIC_AUTH_SEGMENTS.has(firstSegment) &&
    !TOKEN_AUTH_SEGMENTS.has(firstSegment)
  ) {
    return "/(tabs)/(main)/index";
  }

  return null;
}

module.exports = { resolveAuthRedirect };
