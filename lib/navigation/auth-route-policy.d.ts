export type AuthRouteState = {
  firstSegment?: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  splashDone: boolean;
};

export function resolveAuthRedirect(
  state: AuthRouteState,
): "/welcome" | "/(tabs)/(main)/index" | null;
