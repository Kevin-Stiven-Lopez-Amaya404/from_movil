import { useEffect, useState } from "react";

import { useMockApi } from "@/lib/config/api-config";
import type { UserRole } from "@/lib/domain/session";
import {
  loadSession,
  subscribeToSessionChanges,
} from "@/lib/session/session-store";

type UseSessionLifecycleOptions = {
  onDemoSession: () => void;
};

export function useSessionLifecycle({
  onDemoSession,
}: UseSessionLifecycleOptions) {
  const [sessionName, setSessionName] = useState(
    useMockApi ? "Pepe" : "",
  );

  const [sessionEmail, setSessionEmail] = useState(
    useMockApi ? "pepe@smarthome.com" : "",
  );

  const [sessionRole, setSessionRole] =
    useState<UserRole>("miembro");

  const [sessionRevision, setSessionRevision] = useState(0);

  useEffect(() => {
    return subscribeToSessionChanges((session) => {
      setSessionRevision((revision) => revision + 1);

      if (!session) {
        setSessionName("");
        setSessionEmail("");
        setSessionRole("miembro");
        return;
      }

      if (session.mode === "demo") {
        setSessionName(
          session.user.name.split(" ")[0] || session.user.name,
        );
        setSessionEmail(session.user.email);
        setSessionRole(session.user.role ?? "miembro");
        onDemoSession();
      }
    });
  }, [onDemoSession]);

  useEffect(() => {
    let active = true;

    loadSession()
      .then((session) => {
        if (!active) return;

        if (!session) {
          setSessionName("");
          setSessionEmail("");
          setSessionRole("miembro");
          return;
        }

        setSessionName(
          session.user.name.split(" ")[0] || session.user.name,
        );
        setSessionEmail(session.user.email);
        setSessionRole(session.user.role ?? "miembro");
      })
      .catch(() => {
        // La pantalla de autenticación manejará el reintento.
      });

    return () => {
      active = false;
    };
  }, [sessionRevision]);

  return {
    sessionName,
    sessionEmail,
    sessionRole,
    sessionRevision,
    setSessionName,
    setSessionEmail,
    setSessionRole,
  };
}