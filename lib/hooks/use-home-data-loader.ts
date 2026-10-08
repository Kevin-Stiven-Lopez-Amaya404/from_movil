import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

import { useMockApi } from "@/lib/config/api-config";
import type { SmartDevice } from "@/lib/domain/device";
import type {
  HomeInvitation,
  HomeMember,
  SmartHomePlace,
} from "@/lib/domain/home";
import type { UserRole } from "@/lib/domain/session";
import { authService } from "@/lib/services/auth-service";
import { smartHomeService } from "@/lib/services/smart-home-service";
import { loadSession } from "@/lib/session/session-store";

type UseHomeDataLoaderOptions = {
  sessionRevision: number;
  setHomes: Dispatch<SetStateAction<SmartHomePlace[]>>;
  setHomeMembersByHome: Dispatch<
    SetStateAction<Record<string, HomeMember[]>>
  >;
  setIncomingInvitations: Dispatch<SetStateAction<HomeInvitation[]>>;
  setActiveHomeId: Dispatch<SetStateAction<string>>;
  setDevices: Dispatch<SetStateAction<SmartDevice[]>>;
  setSessionRole: Dispatch<SetStateAction<UserRole>>;
  setOfflineMode: Dispatch<SetStateAction<boolean>>;
};

export function useHomeDataLoader({
  sessionRevision,
  setHomes,
  setHomeMembersByHome,
  setIncomingInvitations,
  setActiveHomeId,
  setDevices,
  setSessionRole,
  setOfflineMode,
}: UseHomeDataLoaderOptions) {
  useEffect(() => {
    if (useMockApi) return;

    let active = true;

    loadSession()
      .then(async (session) => {
        if (!session) {
          if (active) {
            setHomes([]);
            setHomeMembersByHome({});
            setIncomingInvitations([]);
            setDevices([]);
            setActiveHomeId("");
            setOfflineMode(false);
          }
          return;
        }

        const [
          listedHomes,
          currentUser,
          pendingInvitations,
        ] = await Promise.all([
          smartHomeService.listHomes(),
          authService.getCurrentUser(),
          smartHomeService.listIncomingInvitations(),
        ]);

        const currentUserId =
          currentUser.userId ?? currentUser.id ?? "";

        const memberEntries = await Promise.all(
          listedHomes.map(
            async (home) =>
              [
                home.id,
                await smartHomeService.listHomeMembers(home.id),
              ] as const,
          ),
        );

        const membersByHome = Object.fromEntries(memberEntries);

        const remoteHomes = listedHomes.map((home) => {
          const currentMembership = membersByHome[home.id]?.find(
            (member) =>
              member.userId === currentUserId &&
              member.status === "ACTIVE",
          );

          return {
            ...home,
            homeRole: currentMembership?.role,
          };
        });

        if (!active) return;

        const firstHome = remoteHomes[0];

        setHomes(remoteHomes);
        setHomeMembersByHome(membersByHome);
        setIncomingInvitations(pendingInvitations);

        const firstMembership = remoteHomes.find(
          (home) => home.homeRole,
        )?.homeRole;

        if (firstMembership) {
          setSessionRole(
            firstMembership === "OWNER"
              ? "admin"
              : firstMembership === "GUEST"
                ? "invitado"
                : "miembro",
          );
        }

        setActiveHomeId((current) =>
          remoteHomes.some((home) => home.id === current)
            ? current
            : (firstHome?.id ?? ""),
        );

        const remoteDevices = (
          await Promise.all(
            remoteHomes.map((home) =>
              smartHomeService.listDevices(home.id),
            ),
          )
        ).flat();

        if (active) {
          setDevices(remoteDevices);
        }
      })
      .catch(() => {
        if (active) {
          setOfflineMode(true);
        }
      });

    return () => {
      active = false;
    };
  }, [
    sessionRevision,
    setActiveHomeId,
    setDevices,
    setHomeMembersByHome,
    setHomes,
    setIncomingInvitations,
    setOfflineMode,
    setSessionRole,
  ]);
}