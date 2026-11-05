import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

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

type DataLoadStatus = "loading" | "loaded" | "error";

type UseHomeDataLoaderOptions = {
  sessionRevision: number;
  setHomes: Dispatch<SetStateAction<SmartHomePlace[]>>;
  setHomesLoadStatus: Dispatch<SetStateAction<DataLoadStatus>>;
  setDeviceLoadStatusByHome: Dispatch<
    SetStateAction<Record<string, DataLoadStatus>>
  >;
  setHomeMembersByHome: Dispatch<
    SetStateAction<Record<string, HomeMember[]>>
  >;
  setIncomingInvitations: Dispatch<SetStateAction<HomeInvitation[]>>;
  setActiveHomeId: Dispatch<SetStateAction<string>>;
  setDevices: Dispatch<SetStateAction<SmartDevice[]>>;
  setSessionRole: Dispatch<SetStateAction<UserRole>>;
};

export function useHomeDataLoader({
  sessionRevision,
  setHomes,
  setHomesLoadStatus,
  setDeviceLoadStatusByHome,
  setHomeMembersByHome,
  setIncomingInvitations,
  setActiveHomeId,
  setDevices,
  setSessionRole,
}: UseHomeDataLoaderOptions) {
  useEffect(() => {
    let active = true;

    // Limpiar los datos de la sesión anterior antes de consultar la nueva.
    setHomesLoadStatus("loading");
    setHomes([]);
    setHomeMembersByHome({});
    setIncomingInvitations([]);
    setDevices([]);
    setDeviceLoadStatusByHome({});
    setActiveHomeId("");

    loadSession()
      .then(async (session) => {
        if (!session) {
          if (active) {
            setHomes([]);
            setHomesLoadStatus("loaded");
            setHomeMembersByHome({});
            setIncomingInvitations([]);
            setDevices([]);
            setDeviceLoadStatusByHome({});
            setActiveHomeId("");
          }
          return;
        }

        const [homesResult, userResult, invitationsResult] =
          await Promise.allSettled([
            smartHomeService.listHomes(),
            authService.getCurrentUser(),
            smartHomeService.listIncomingInvitations(),
          ]);

        if (homesResult.status === "rejected") {
          throw homesResult.reason;
        }

        if (userResult.status === "rejected") {
          throw userResult.reason;
        }

        const listedHomes = homesResult.value;
        const currentUser = userResult.value;

        const pendingInvitations =
          invitationsResult.status === "fulfilled"
            ? invitationsResult.value
            : [];

        if (invitationsResult.status === "rejected") {
          console.warn(
            "[HomeDataLoader] No se pudieron cargar las invitaciones recibidas.",
          );
        }

        const currentUserId =
          currentUser.userId ?? currentUser.id ?? "";

        const memberResults = await Promise.allSettled(
          listedHomes.map((home) =>
            smartHomeService.listHomeMembers(home.id),
          ),
        );

        const membersByHome: Record<string, HomeMember[]> = {};

        memberResults.forEach((result, index) => {
          const home = listedHomes[index];
          if (!home) return;

          if (result.status === "fulfilled") {
            membersByHome[home.id] = result.value;
          } else {
            console.warn(
              "[HomeDataLoader] No se pudieron cargar los miembros del hogar:",
              home.id,
            );
          }
        });

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
        setHomesLoadStatus("loaded");
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

        if (active) {
          setDeviceLoadStatusByHome(
            Object.fromEntries(
              remoteHomes.map((home) => [home.id, "loading" as const]),
            ),
          );
        }

        const deviceResults = await Promise.allSettled(
          remoteHomes.map((home) =>
            smartHomeService.listDevices(home.id),
          ),
        );

        const remoteDevices: SmartDevice[] = [];
        const nextDeviceLoadStatusByHome: Record<string, DataLoadStatus> = {};

        deviceResults.forEach((result, index) => {
          const home = remoteHomes[index];
          if (!home) return;

          if (result.status === "fulfilled") {
            nextDeviceLoadStatusByHome[home.id] = "loaded";
            remoteDevices.push(...result.value);
          } else {
            nextDeviceLoadStatusByHome[home.id] = "error";
            console.warn(
              "[HomeDataLoader] No se pudieron cargar los dispositivos del hogar:",
              home.id,
            );
          }
        });

        if (active) {
          setDevices(remoteDevices);
          setDeviceLoadStatusByHome(nextDeviceLoadStatusByHome);
        }
      })
      .catch(() => {
        if (active) {
          setHomesLoadStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, [
    sessionRevision,
    setActiveHomeId,
    setDevices,
    setDeviceLoadStatusByHome,
    setHomeMembersByHome,
    setHomes,
    setHomesLoadStatus,
    setIncomingInvitations,
    setSessionRole,
  ]);
}
