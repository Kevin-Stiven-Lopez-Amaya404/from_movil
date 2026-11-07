import { useEffect, useState } from "react";

import type { UserRole } from "@/lib/domain/session";
import {
  loadSession,
  subscribeToSessionChanges,
} from "@/lib/session/session-store";

export function useSessionLifecycle() {
  const [sessionName, setSessionName] = useState("");
  const [sessionEmail, setSessionEmail] = useState("");

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

    });
  }, []);

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
