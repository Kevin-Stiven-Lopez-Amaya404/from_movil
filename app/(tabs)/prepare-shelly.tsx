
import { Ionicons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ShellyLanTelemetry } from "@/components/shelly/shelly-lan-telemetry";
import { ApiError } from "@/lib/api/api-error";
import { useSmartHome } from "@/lib/context/smart-home-context";
import type { PairingSession } from "@/lib/pairing/pairing-types";
import { readShellyLocalIdentity } from "@/lib/pairing/shelly-local-identity";
import {
  configureShellyMqttLocally,
  readShellyMqttStatus,
} from "@/lib/pairing/shelly-mqtt-local-provisioning";
import {
  confirmAndCompleteShellyMqtt,
  prepareAndEnableShellyMqtt,
  type ShellyMqttPairingDependencies,
  type ShellyMqttProvisioningStage,
} from "@/lib/pairing/shelly-mqtt-pairing-flow";
import { useResponsiveLayout } from "@/lib/responsive/responsive";
import { pairingService } from "@/lib/services/pairing-service";
import { useAppTheme } from "@/lib/theme/app-theme";
import { styles } from "../../styles/(tabs)/prepare-shelly.styles";

type VerificationState =
  | "checking"
  | "verified"
  | "error";

const VERIFICATION_TIMEOUT_MS = 6000;
const MAX_NAME_LENGTH = 100;

export default function PrepareShellyScreen() {
  const router = useRouter();

  const {
    homeId,
    ip,
    manufacturerDeviceId,
    returnTo,
    from,
  } = useLocalSearchParams<{
    homeId?: string;
    ip?: string;
    manufacturerDeviceId?: string;
    returnTo?: string;
    from?: string;
  }>();

  const { accessibleHomes, homesLoadStatus } =
    useSmartHome();

  const theme = useAppTheme();
  const layout = useResponsiveLayout();

  const home = accessibleHomes.find(
    (item) => item.id === homeId,
  );

  const canPrepare = home?.homeRole === "OWNER";

  const searchRoute = useMemo(() => homeId
    ? {
        pathname: "/(tabs)/add-device" as const,
        params: {
          homeId,
          returnTo:
            returnTo === "home-detail"
              ? "home-detail"
              : "devices",
        },
      }
    : ("/(tabs)/devices" as const), [homeId, returnTo]);

  useEffect(() => {
    if (
      homesLoadStatus === "loaded" &&
      (!homeId || !home)
    ) {
      router.replace("/(tabs)/(main)/homes");
    }
  }, [homeId, home, homesLoadStatus, router]);

  const [verification, setVerification] =
    useState<VerificationState>("checking");

  const [verificationError, setVerificationError] =
    useState<string | null>(null);

  const [deviceName, setDeviceName] = useState("");
  const [confirmedName, setConfirmedName] =
    useState<string | null>(null);

  const [pairingLoading, setPairingLoading] = useState(false);
  const [pairingError, setPairingError] = useState<string | null>(null);
  const [mqttSetupNotice, setMqttSetupNotice] = useState<string | null>(null);
  const [mqttSetupAttemptedForRender, setMqttSetupAttemptedForRender] = useState(false);
  const [mqttOperationReady, setMqttOperationReady] = useState(false);
  const [localMqttConnected, setLocalMqttConnected] = useState<boolean | null>(null);
  const mqttSetupAttempted = useRef(false);
  const mqttOperationId = useRef<string | null>(null);
  const mqttConfirmAttempted = useRef(false);
  const [pairingSession, setPairingSession] =
    useState<PairingSession | null>(null);
  const [pairingExpired, setPairingExpired] = useState(false);


  const pairingInProgress = useRef(false);
  const pairingAttempt = useRef<
    ReturnType<typeof pairingService.createAttempt> | null
  >(null);

  const activePairing = useRef<{
    homeId: string;
    sessionId: string;
    sessionToken: string;
    expiresAt: string;
  } | null>(null);

  const checkRun = useRef(0);

  const requestController =
    useRef<AbortController | null>(null);

  const verifySelectedDevice = useCallback(async () => {
    const run = ++checkRun.current;

    requestController.current?.abort();

    const controller = new AbortController();
    requestController.current = controller;

    const timeout = setTimeout(
      () => controller.abort(),
      VERIFICATION_TIMEOUT_MS,
    );

    setVerification("checking");
    setVerificationError(null);
    setConfirmedName(null);

    try {
      if (!ip || !manufacturerDeviceId) {
        throw new Error(
          "No se recibió la identificación del Shelly. " +
          "Vuelve a buscarlo.",
        );
      }

      // Verificar nuevamente la identidad del equipo.
      const identity = await readShellyLocalIdentity(
        ip,
        controller.signal,
      );

      if (
        identity.manufacturerDeviceId !==
        manufacturerDeviceId
      ) {
        throw new Error(
          "La identidad del dispositivo cambió. " +
          "Vuelve a buscarlo.",
        );
      }

      if (run !== checkRun.current) return;

      setVerification("verified");
    } catch (error) {
      if (run !== checkRun.current) return;

      setVerification("error");

      setVerificationError(
        error instanceof Error &&
        error.name === "AbortError"
          ? "No se pudo comprobar el Shelly a tiempo."
          : error instanceof Error
            ? error.message
            : "No se pudo identificar el dispositivo.",
      );
    } finally {
      clearTimeout(timeout);

      if (
        requestController.current === controller
      ) {
        requestController.current = null;
      }
    }
  }, [ip, manufacturerDeviceId]);

  useEffect(() => {
    if (
      !canPrepare ||
      homesLoadStatus !== "loaded"
    ) {
      return;
    }

    // La comprobacion HTTP inicia despues de montar el componente.
    const startTimer = setTimeout(() => {
      void verifySelectedDevice();
    }, 0);

    return () => {
      clearTimeout(startTimer);
      checkRun.current += 1;
      requestController.current?.abort();
      requestController.current = null;
    };
  }, [
    canPrepare,
    homesLoadStatus,
    verifySelectedDevice,
  ]);

  const navigateToSearch = useCallback(() => {
    if (
      from === "add-device" &&
      router.canGoBack()
    ) {
      router.back();
    } else {
      router.replace(searchRoute);
    }
  }, [from, router, searchRoute]);

  const backToSearch = useCallback(async () => {
    if (pairingInProgress.current) {
      return;
    }

    let shouldNavigate = false;
    const active = activePairing.current;

    if (!active || pairingSession?.status === "COMPLETED") {
      navigateToSearch();
      return;
    }

    pairingInProgress.current = true;
    setPairingLoading(true);
    setPairingError(null);

    try {
      const result = await pairingService.cancelSession(
        active.homeId,
        active.sessionId,
        active.sessionToken,
      );

      if (
        result.status === "COMPLETED" ||
        result.status === "CANCELLED" ||
        result.status === "EXPIRED" ||
        result.status === "FAILED"
      ) {
        activePairing.current = null;
        mqttOperationId.current = null;
        mqttConfirmAttempted.current = false;
        mqttSetupAttempted.current = false;
        setMqttSetupAttemptedForRender(false);
        setMqttOperationReady(false);
        setLocalMqttConnected(null);
        setMqttSetupNotice(null);
        setPairingSession(result.status === "COMPLETED" ? result : null);
        shouldNavigate = true;
      } else {
        setPairingSession(result);
        setPairingError(
          "La sesión continúa activa. Intenta cancelarla nuevamente.",
        );
      }
    } catch (error) {
      setPairingError(
        error instanceof Error
          ? error.message
          : "No fue posible cerrar la sesión de vinculación.",
      );
    } finally {
      pairingInProgress.current = false;
      setPairingLoading(false);
      if (shouldNavigate) navigateToSearch();
    }
  }, [navigateToSearch, pairingSession?.status]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android") {
        return;
      }

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          void backToSearch();

          // Consumir el evento para impedir
          // que Android navegue sin cancelar.
          return true;
        },
      );

      return () => {
        subscription.remove();
      };
    }, [backToSearch]),
  );



  async function startPairing() {
    if (
      pairingInProgress.current ||
      !canPrepare ||
      verification !== "verified" ||
      !homeId ||
      !ip ||
      !manufacturerDeviceId ||
      !confirmedName ||
      confirmedName !== deviceName.trim() ||
      activePairing.current
    ) {
      return;
    }

    pairingInProgress.current = true;
    setPairingLoading(true);
    setPairingError(null);

    let createdSession:
      | Awaited<ReturnType<typeof pairingService.createSession>>
      | undefined;

    try {
      // Consultamos nuevamente el dispositivo real.
      const identity = await readShellyLocalIdentity(ip);

      if (
        identity.manufacturerDeviceId !== manufacturerDeviceId
      ) {
        throw new Error(
          "La identidad del Shelly cambió. Vuelve a buscar el dispositivo.",
        );
      }

      // Creamos la sesión temporal en el backend.
      // Reutilizar el mismo intento ante errores temporales.
      const attempt =
        pairingAttempt.current ?? pairingService.createAttempt();

      pairingAttempt.current = attempt;

      createdSession = await pairingService.createSession(
        homeId,
        attempt,
      );

      // El backend confirmó la creación de la sesión.
      pairingAttempt.current = null;

      const { session, sessionToken } = createdSession;

      // Conservamos el token únicamente en memoria.
      activePairing.current = {
        homeId,
        sessionId: session.sessionId,
        sessionToken,
        expiresAt: session.expiresAt,
      };

      setPairingSession(session);
      setPairingExpired(false);
      mqttSetupAttempted.current = false;
      mqttConfirmAttempted.current = false;
      mqttOperationId.current = null;
      setMqttSetupAttemptedForRender(false);
      setMqttOperationReady(false);
      setLocalMqttConnected(null);
      setMqttSetupNotice(null);

      // Reportamos la identidad local al backend.
      const identifiedSession =
        await pairingService.identifyDevice(
          homeId,
          session.sessionId,
          sessionToken,
          identity,
        );

      setPairingSession(identifiedSession);
    } catch (error) {
      // Solo conservamos el intento cuando no sabemos
      // si el backend recibió la solicitud.
      if (error instanceof ApiError) {
        const mayHaveReachedBackend =
          error.code === "NETWORK_ERROR" ||
          error.code === "SERVER_ERROR";

        if (!mayHaveReachedBackend) {
          pairingAttempt.current = null;
        }
      } else {
        pairingAttempt.current = null;
      }

      setPairingError(
        error instanceof Error
          ? error.message
          : "No fue posible iniciar la vinculación.",
      );
    } finally {
      pairingInProgress.current = false;
      setPairingLoading(false);
    }
  }

  async function retryPairingIdentification() {
    const active = activePairing.current;

    // Nunca descartar silenciosamente el toque: un Fast Refresh puede dejar
    // visible PENDING sin conservar el token temporal en memoria.
    if (!active) {
      setPairingError(
        "No se conserva el token de esta sesión en el teléfono. No es seguro reintentar ni crear otra sesión todavía. Espera a que expire y prepara una nueva vinculación.",
      );
      return;
    }
    if (pairingInProgress.current) {
      setPairingError(
        "Ya hay una operación de vinculación en curso. Consulta su resultado antes de reintentar.",
      );
      return;
    }
    if (!ip || !manufacturerDeviceId) {
      setPairingError(
        "No están disponibles la IP o la identidad local del Shelly. No se realizó ninguna escritura.",
      );
      return;
    }
    if (!canPrepare) {
      setPairingError(
        "Solo el propietario (OWNER) del hogar puede identificar el Shelly.",
      );
      return;
    }
    if (pairingExpired || pairingSession?.status !== "PENDING") {
      setPairingError(
        "La sesión ya no está pendiente. Consulta el estado antes de continuar.",
      );
      return;
    }

    pairingInProgress.current = true;
    setPairingLoading(true);
    setPairingError(null);

    try {
      // Consultar primero la verdad del backend.
      const currentSession = await pairingService.getSession(
        active.homeId,
        active.sessionId,
        active.sessionToken,
      );

      setPairingSession(currentSession);

      // La identificación ya fue confirmada por el backend.
      if (currentSession.status === "DEVICE_IDENTIFIED") {
        return;
      }

      // No repetir operaciones en estados incompatibles.
      if (currentSession.status !== "PENDING") {
        return;
      }

      // Confirmar nuevamente la identidad física por LAN.
      const identity = await readShellyLocalIdentity(ip);

      if (
        identity.manufacturerDeviceId !== manufacturerDeviceId
      ) {
        throw new Error(
          "La identidad del Shelly cambió. Vuelve a buscar el dispositivo.",
        );
      }

      const identifiedSession =
        await pairingService.identifyDevice(
          active.homeId,
          active.sessionId,
          active.sessionToken,
          identity,
        );

      setPairingSession(identifiedSession);
    } catch (error) {
      setPairingError(
        error instanceof Error
          ? error.message
          : "No fue posible recuperar la sesión del Shelly.",
      );
    } finally {
      pairingInProgress.current = false;
      setPairingLoading(false);
    }
  }

  async function cancelPairing() {
    const active = activePairing.current;

    if (!active || pairingInProgress.current) {
      return;
    }

    pairingInProgress.current = true;
    setPairingLoading(true);
    setPairingError(null);

    try {
      const result = await pairingService.cancelSession(
        active.homeId,
        active.sessionId,
        active.sessionToken,
      );

      if (
        result.status === "CANCELLED" ||
        result.status === "EXPIRED" ||
        result.status === "FAILED"
      ) {
        activePairing.current = null;
        mqttOperationId.current = null;
        mqttConfirmAttempted.current = false;
        mqttSetupAttempted.current = false;
        setMqttSetupAttemptedForRender(false);
        setMqttOperationReady(false);
        setLocalMqttConnected(null);
        setMqttSetupNotice(null);
        setPairingSession(null);
        setPairingError(null);
      } else if (result.status === "COMPLETED") {
        activePairing.current = null;
        mqttOperationId.current = null;
        mqttConfirmAttempted.current = false;
        setMqttOperationReady(false);
        setPairingSession(result);
      } else {
        setPairingSession(result);
      }
    } catch (error) {
      setPairingError(
        error instanceof Error
          ? error.message
          : "No fue posible cancelar la sesión.",
      );
    } finally {
      pairingInProgress.current = false;
      setPairingLoading(false);
    }
  }

  /**
   * Consulta el backend: la detección LAN nunca equivale a CONNECTED.
   * No usamos reintentos automáticos que puedan duplicar la operación.
   */

  /**
   * Flujo EXPLICITO para laboratorio aislado, sin reintentos automaticos.
   * No se conserva la password en estado React ni almacenamiento persistente.
   * El backend debe exigir HTTPS antes de entregar la identidad individual.
   */
  function createMqttPairingDependencies(
    active: NonNullable<typeof activePairing.current>,
    name: string,
  ): ShellyMqttPairingDependencies {
    if (!ip || !manufacturerDeviceId) {
      throw new Error("SHELLY_PROVISIONING_TARGET_INVALID");
    }
    const assertActive = () => {
      if (!canPrepare || activePairing.current?.sessionId !== active.sessionId) {
        throw new Error("PAIRING_SESSION_CHANGED");
      }
      if (!Number.isFinite(Date.parse(active.expiresAt)) ||
          Date.parse(active.expiresAt) <= Date.now()) {
        throw new Error("PAIRING_SESSION_EXPIRED");
      }
    };
    const sessionArgs = [active.homeId, active.sessionId, active.sessionToken] as const;

    return {
      prepareMqtt: () => {
        assertActive();
        return pairingService.prepareMqtt(...sessionArgs);
      },
      advanceToWaiting: async () => {
        assertActive();
        const waiting = await pairingService.completeSession(...sessionArgs, name);
        setPairingSession(waiting);
        return waiting;
      },
      authorizeBootstrap: (operationId) => {
        assertActive();
        return pairingService.authorizeMqttBootstrap(...sessionArgs, operationId);
      },
      configureLocally: (authorization) => {
        assertActive();
        return configureShellyMqttLocally({
          ip,
          expectedDeviceId: manufacturerDeviceId,
          authorization,
          explicitlyTrustedLocalNetwork: true,
        });
      },
      enableMqtt: (operationId) => {
        assertActive();
        return pairingService.enablePreparedMqtt(...sessionArgs, operationId);
      },
      readLocalMqttStatus: () => {
        assertActive();
        return readShellyMqttStatus({ ip, expectedDeviceId: manufacturerDeviceId });
      },
      confirmMqtt: (operationId) => {
        assertActive();
        if (mqttConfirmAttempted.current) {
          throw new Error("MQTT_CONFIRM_ALREADY_ATTEMPTED_REQUIRES_RECONCILIATION");
        }
        mqttConfirmAttempted.current = true;
        return pairingService.confirmMqttAuthentication(...sessionArgs, operationId);
      },
      getSession: () => pairingService.getSession(...sessionArgs),
      completeSession: () => {
        assertActive();
        return pairingService.completeSession(...sessionArgs, name);
      },
    };
  }

  async function finishMqttPairing(
    active: NonNullable<typeof activePairing.current>,
    operationId: string,
    name: string,
  ) {
    const result = await confirmAndCompleteShellyMqtt(
      { operationId },
      createMqttPairingDependencies(active, name),
    );
    if (result.phase === "COMPLETED") {
      setPairingSession(result.session);
      setMqttSetupNotice("El backend confirmó la autenticación MQTT y completó la vinculación.");
      setMqttOperationReady(false);
      mqttOperationId.current = null;
      mqttConfirmAttempted.current = false;
      activePairing.current = null;
      return;
    }
    setLocalMqttConnected(result.mqttConnected);
    setMqttSetupNotice(
      result.mqttConnected
        ? "El Shelly está conectado. Consulta el estado del backend para conciliar la autenticación."
        : "El Shelly aún no aparece conectado por MQTT. Puedes volver a verificar el estado; no se repetirá la configuración.",
    );
  }

  /** Cada escritura se ejecuta una sola vez; las consultas posteriores son de solo lectura. */
  async function configureMqttForTrustedLab() {
    const active = activePairing.current;
    if (!__DEV__ || !active || !ip || !manufacturerDeviceId || !canPrepare ||
        !confirmedName || confirmedName !== deviceName.trim() ||
        pairingInProgress.current || pairingExpired || !pairingSession ||
        !["DEVICE_IDENTIFIED", "WAITING_FOR_MQTT"].includes(pairingSession.status) ||
        mqttSetupAttempted.current) return;

    mqttSetupAttempted.current = true;
    setMqttSetupAttemptedForRender(true);
    pairingInProgress.current = true;
    setPairingLoading(true);
    setPairingError(null);
    setMqttSetupNotice(null);
    let currentStage: ShellyMqttProvisioningStage = 'PREPARING_BROKER_IDENTITY';
    try {
      const progress = await prepareAndEnableShellyMqtt(
        createMqttPairingDependencies(active, confirmedName),
        {
          onStage: (stage) => { currentStage = stage; },
          onPrepared: (operationId) => {
            mqttOperationId.current = operationId;
          },
          onLocalConfigurationVerified: (local) => {
            setLocalMqttConnected(local.mqttConnected);
            setMqttOperationReady(true);
          },
        },
      );
      setLocalMqttConnected(progress.mqttConnected);
      if (progress.mqttConnected) {
        await finishMqttPairing(active, progress.operationId, confirmedName);
      } else {
        setMqttSetupNotice(
          progress.restartRequired
            ? "El Shelly reinició y confirmó su configuración TLS. Esperando conexión MQTT para verificarla con el backend."
            : "La configuración TLS quedó verificada. Esperando conexión MQTT para verificarla con el backend.",
        );
      }
    } catch (error) {
      const needsHttps = error instanceof Error &&
        ["MQTT_BOOTSTRAP_REQUIRES_HTTPS_BACKEND_DEV",
          "MQTT_ENABLE_REQUIRES_HTTPS_BACKEND_DEV",
          "MQTT_CONFIRM_REQUIRES_HTTPS_BACKEND_DEV"].includes(error.message);
      // Sólo códigos de error internos y etapas; nunca imprimir respuestas RPC,
      // contraseñas, tokens de sesión ni payloads del backend.
      const diagnostic = error instanceof Error
        ? error instanceof ApiError
          ? `API_${error.code}_${error.status ?? 'SIN_HTTP'}`
          : /^([A-Z][A-Z0-9_]{2,90})$/.test(error.message)
            ? error.message
            : 'ERROR_NO_CLASIFICADO'
        : 'ERROR_NO_CLASIFICADO';
      setPairingError(needsHttps
        ? "El backend de desarrollo debe responder por HTTPS para entregar la credencial MQTT."
        : `El aprovisionamiento se detuvo en ${currentStage} (${diagnostic}). Consulta el estado antes de cancelar; no se repetirán escrituras automáticamente.`);
    } finally {
      pairingInProgress.current = false;
      setPairingLoading(false);
    }
  }

  async function verifyMqttAuthenticationAndComplete() {
    const active = activePairing.current;
    const operationId = mqttOperationId.current;
    const name = confirmedName;
    if (!active || !operationId || !name || !mqttOperationReady ||
        pairingInProgress.current || pairingExpired || !canPrepare) return;

    pairingInProgress.current = true;
    setPairingLoading(true);
    setPairingError(null);
    try {
      await finishMqttPairing(active, operationId, name);
    } catch {
      // El usuario puede consultar el estado persistido; confirm no se reenvía.
      setPairingError(
        mqttConfirmAttempted.current
          ? "No hay confirmación final del backend. La petición no se repetirá; consulta el estado o cancela la sesión para reconciliarla."
          : "Aún no se pudo verificar la autenticación MQTT. La sesión sigue pendiente; revisa la conexión local antes de continuar.",
      );
    } finally {
      pairingInProgress.current = false;
      setPairingLoading(false);
    }
  }
  function confirmTrustedLabSetup() {
    if (!__DEV__ || mqttSetupAttempted.current) return;
    Alert.alert(
      'Solo laboratorio privado',
      'La API de SmartHome debe usar HTTPS. La RPC local del Shelly usa HTTP y ' +
      'transmite su contraseña MQTT por la red Wi-Fi. Úsalo solo en una red aislada ' +
      'que administras, sin invitados ni dispositivos no confiables. ' +
      'El resultado NO registra ni autentica automáticamente el Shelly.',
      [
        {text: 'Cancelar', style: 'cancel'},
        {text: 'Confirmo red aislada', onPress: () => void configureMqttForTrustedLab()},
      ],
    );
  }

  async function refreshMqttStatus() {
    const active = activePairing.current;
    if (!active || pairingInProgress.current || pairingExpired) return;
    pairingInProgress.current = true;
    setPairingLoading(true);
    setPairingError(null);
    try {
      const current = await pairingService.getSession(
        active.homeId,
        active.sessionId,
        active.sessionToken,
      );
      setPairingSession(current);
      if (current.status === "EXPIRED") setPairingExpired(true);
      if (current.status === "COMPLETED") {
        activePairing.current = null;
        mqttOperationId.current = null;
        mqttConfirmAttempted.current = false;
        setMqttOperationReady(false);
      }
    } catch (error) {
      setPairingError(
        error instanceof Error ? error.message : "No se pudo consultar la conexión MQTT.",
      );
    } finally {
      pairingInProgress.current = false;
      setPairingLoading(false);
    }
  }

  /**
   * No registra un dispositivo sin la confirmación CONNECTED del backend.
   * El backend vuelve a validar sesión, propietario, token y estado.
   */
  async function completeVerifiedPairing() {
    const active = activePairing.current;
    if (
      !active || pairingInProgress.current || pairingExpired ||
      pairingSession?.status !== "CONNECTED" || !canPrepare ||
      !confirmedName || confirmedName !== deviceName.trim()
    ) return;

    pairingInProgress.current = true;
    setPairingLoading(true);
    setPairingError(null);
    try {
      const current = await pairingService.getSession(
        active.homeId,
        active.sessionId,
        active.sessionToken,
      );
      setPairingSession(current);
      if (current.status === "COMPLETED") {
        if (!current.completion?.deviceId) {
          throw new Error("MQTT_COMPLETION_STATE_UNCERTAIN");
        }
        activePairing.current = null;
        mqttOperationId.current = null;
        mqttConfirmAttempted.current = false;
        setMqttOperationReady(false);
        return;
      }
      if (current.status !== "CONNECTED") {
        throw new Error("MQTT_BACKEND_AUTH_STATE_UNCONFIRMED");
      }
      const completed = await pairingService.completeSession(
        active.homeId,
        active.sessionId,
        active.sessionToken,
        confirmedName,
      );
      setPairingSession(completed);
      if (completed.status !== "COMPLETED" || !completed.completion?.deviceId) {
        setPairingError(
          "El backend todavía no confirmó el registro. Consulta el estado antes de reintentar.",
        );
      }
    } catch (error) {
      // Un error de red después del commit es ambiguo. Consultar antes de reintentar.
      setPairingError(
        error instanceof Error ? error.message : "No se pudo confirmar el registro. Consulta el estado.",
      );
    } finally {
      pairingInProgress.current = false;
      setPairingLoading(false);
    }
  }

  function resetExpiredPairing() {
    if (!pairingExpired || pairingInProgress.current) {
      return;
    }

    const status = pairingSession?.status;

    // No descartamos una vinculación completada.
    if (status === "COMPLETED") {
      return;
    }

    activePairing.current = null;
    mqttOperationId.current = null;
    mqttConfirmAttempted.current = false;
    mqttSetupAttempted.current = false;
    setMqttSetupAttemptedForRender(false);
    setMqttOperationReady(false);
    setLocalMqttConnected(null);
    setMqttSetupNotice(null);

    setPairingSession(null);
    setPairingExpired(false);
    setPairingError(null);
  }

  useEffect(() => {
    if (!pairingSession?.expiresAt) return;

    const expirationTime = new Date(pairingSession.expiresAt).getTime();
    if (!Number.isFinite(expirationTime)) return;

    // Incluso una sesion ya expirada se procesa desde el temporizador.
    const remainingMs = Math.max(0, expirationTime - Date.now());
    const timeout = setTimeout(() => {
      setPairingExpired(true);
    }, remainingMs);

    return () => clearTimeout(timeout);
  }, [pairingSession?.expiresAt]);

  const trimmedName = deviceName.trim();

  const nameIsValid =
    trimmedName.length > 0 &&
    trimmedName.length <= MAX_NAME_LENGTH;

  const canConfirm =
    canPrepare &&
    verification === "verified" &&
    nameIsValid;

  const isConfirmed = Boolean(
    confirmedName &&
    confirmedName === trimmedName,
  );

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.background },
      ]}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: layout.gutter,
          paddingTop: layout.screenTop,
          paddingBottom: layout.screenBottom,
        }}
      >
        <View
          style={[
            styles.content,
            { maxWidth: layout.contentWidth },
          ]}
        >
          {/* Encabezado */}
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar preparación del dispositivo"
              disabled={pairingLoading}
              onPress={() => void backToSearch()}
              style={[
                styles.backButton,
                { backgroundColor: theme.rowAlt },
                pairingLoading && styles.disabled,
              ]}
            >
              <Ionicons
                name="close"
                size={21}
                color={theme.text}
              />
            </Pressable>

            <Text
              style={[
                styles.title,
                { color: theme.text },
              ]}
            >
              Preparar dispositivo
            </Text>
          </View>

          {/* Dispositivo seleccionado */}
          <Text
            style={[
              styles.kicker,
              { color: theme.muted },
            ]}
          >
            Dispositivo seleccionado
          </Text>

          <View style={styles.deviceHeadline}>
            <View
              style={[
                styles.deviceIcon,
                { backgroundColor: theme.rowAlt },
              ]}
            >
              <Ionicons
                name="hardware-chip-outline"
                size={25}
                color={theme.blue}
              />
            </View>

            <View style={styles.deviceHeadingText}>
              <Text
                style={[
                  styles.deviceName,
                  { color: theme.text },
                ]}
              >
                Shelly 1PM Gen4
              </Text>

              <Text
                style={[
                  styles.deviceStatus,
                  { color: theme.muted },
                ]}
              >
                {verification === "checking"
                  ? "Comprobando el dispositivo..."
                  : verification === "verified"
                    ? "Modelo compatible"
                    : "Verificación pendiente"}
              </Text>
            </View>

            {verification === "checking" ? (
              <ActivityIndicator color={theme.blue} />
            ) : verification === "verified" ? (
              <Ionicons
                name="checkmark-circle-outline"
                size={23}
                color={theme.blue}
              />
            ) : null}
          </View>

          {/* Error de identificación */}
          {verification === "error" ? (
            <View style={styles.errorSection}>
              <Text
                style={[
                  styles.helperText,
                  { color: theme.danger },
                ]}
              >
                {verificationError}
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  void verifySelectedDevice()
                }
                style={styles.retryButton}
              >
                <Text
                  style={{
                    color: theme.blue,
                    fontWeight: "700",
                  }}
                >
                  Reintentar verificación
                </Text>
              </Pressable>
            </View>
          ) : null}

          <View
            style={[
              styles.divider,
              { backgroundColor: theme.borderLight },
            ]}
          />

          {verification === "verified" && ip && manufacturerDeviceId ? (
            <ShellyLanTelemetry ip={ip} expectedId={manufacturerDeviceId} />
          ) : null}
          {/* Hogar seleccionado */}
          <Text
            style={[
              styles.label,
              { color: theme.muted },
            ]}
          >
            Hogar seleccionado
          </Text>

          <View style={styles.homeRow}>
            <Ionicons
              name="home-outline"
              size={19}
              color={theme.blue}
            />

            <Text
              style={[
                styles.homeName,
                { color: theme.text },
              ]}
            >
              {home?.name ?? "No disponible"}
            </Text>
          </View>

          {/* Nombre del dispositivo */}
          <Text
            style={[
              styles.label,
              {
                color: theme.text,
                marginTop: 26,
              },
            ]}
          >
            Nombre del dispositivo
          </Text>

          <TextInput
            accessibilityLabel="Nombre del dispositivo Shelly"
            value={deviceName}
            onChangeText={(value) => {
              setDeviceName(value);
              setConfirmedName(null);
            }}
            placeholder="Ej. Luz de la sala"
            placeholderTextColor={theme.muted}
            maxLength={MAX_NAME_LENGTH}
            autoCapitalize="sentences"
            autoCorrect={false}
            editable={Boolean(canPrepare)}
            style={[
              styles.nameInput,
              {
                color: theme.text,
                backgroundColor: theme.card,
                borderColor: theme.borderLight,
              },
            ]}
          />

          <Text
            style={[
              styles.helperText,
              { color: theme.muted },
            ]}
          >
            Así se identificará cuando se complete
            su vinculación al hogar.
          </Text>

          {/* Confirmación local */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Confirmar nombre del dispositivo"
            disabled={!canConfirm}
            onPress={() => {
              if (canConfirm) {
                setConfirmedName(trimmedName);
              }
            }}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: theme.blue },
              !canConfirm && styles.disabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              Confirmar nombre
            </Text>
          </Pressable>

          {isConfirmed ? (
            <View style={styles.confirmation}>
              <Ionicons
                name="checkmark-circle-outline"
                size={21}
                color={theme.blue}
              />

              <View style={{ flex: 1, gap: 4 }}>
                <Text
                  style={{
                    color: theme.text,
                    fontWeight: "800",
                  }}
                >
                  Nombre preparado: {confirmedName}
                </Text>

                <Text
                  style={[
                    styles.helperText,
                    { color: theme.muted },
                  ]}
                >
                  Este dato está solo en esta pantalla;
                  todavía no se ha guardado ni vinculado
                  al hogar.
                </Text>
              </View>
            </View>
          ) : null}

          {isConfirmed && !pairingSession ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Iniciar vinculación del Shelly"
              disabled={pairingLoading}
              onPress={() => void startPairing()}
              style={[
                styles.primaryButton,
                { backgroundColor: theme.blue },
                pairingLoading && styles.disabled,
              ]}
            >
              {pairingLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Iniciar vinculación
                </Text>
              )}
            </Pressable>
          ) : null}

          {pairingSession ? (
            <View style={styles.confirmation}>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={{ color: theme.text, fontWeight: "800" }}>
                  {pairingSession.status === "COMPLETED"
                    ? "Shelly vinculado al hogar"
                    : "Sesión de vinculación creada"}
                </Text>

                <Text style={{ color: theme.muted }}>
                  Estado: {pairingSession.status}
                </Text>

                <Text style={styles.helperText}>
                  {pairingSession.status === "COMPLETED"
                    ? "El backend confirmó la identidad MQTT y registró el dispositivo."
                    : pairingSession.status === "CONNECTED"
                      ? "Conexión MQTT confirmada. Ya puedes finalizar el registro."
                      : "La vinculación definitiva está pendiente de verificar la conexión MQTT."}
                </Text>
              </View>
            </View>
          ) : null}

          {pairingSession &&
            ["DEVICE_IDENTIFIED", "WAITING_FOR_MQTT", "CONNECTED"].includes(pairingSession.status) &&
            !pairingExpired ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Consultar estado MQTT con el backend"
              disabled={pairingLoading}
              onPress={() => void refreshMqttStatus()}
              style={[styles.retryButton, pairingLoading && styles.disabled]}
            >
              <Text style={{ color: theme.blue, fontWeight: "700" }}>
                {pairingLoading ? "Consultando..." : "Consultar conexión MQTT"}
              </Text>
            </Pressable>
          ) : null}


          {__DEV__ && pairingSession &&
            ['DEVICE_IDENTIFIED', 'WAITING_FOR_MQTT'].includes(pairingSession.status) &&
            !pairingExpired && !mqttSetupAttemptedForRender ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Configurar MQTT Shelly en laboratorio aislado"
              disabled={pairingLoading}
              onPress={confirmTrustedLabSetup}
              style={[styles.primaryButton, {backgroundColor: theme.blue},
                pairingLoading && styles.disabled]}
            >
              <Text style={styles.primaryButtonText}>Configurar MQTT (laboratorio)</Text>
            </Pressable>
          ) : null}

          {mqttSetupNotice ? (
            <Text style={[styles.helperText, {color: theme.muted}]}>
              {mqttSetupNotice}
            </Text>
          ) : null}
          {localMqttConnected !== null ? (
            <Text style={[styles.helperText, {color: theme.muted}]}>
              Estado local Shelly: {localMqttConnected ? "conectado" : "sin conexión"}.
              El backend debe confirmar la autenticación.
            </Text>
          ) : null}

          {__DEV__ && pairingSession?.status === "WAITING_FOR_MQTT" &&
            mqttOperationReady && !pairingExpired ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Verificar autenticación MQTT con el backend y finalizar"
              disabled={pairingLoading}
              onPress={() => void verifyMqttAuthenticationAndComplete()}
              style={[styles.primaryButton, { backgroundColor: theme.blue },
                pairingLoading && styles.disabled]}
            >
              {pairingLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Verificar MQTT y finalizar
                </Text>
              )}
            </Pressable>
          ) : null}

          {pairingSession?.status === "CONNECTED" && !pairingExpired ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Finalizar vinculación del Shelly en el hogar"
              disabled={pairingLoading}
              onPress={() => void completeVerifiedPairing()}
              style={[
                styles.primaryButton,
                { backgroundColor: theme.blue },
                pairingLoading && styles.disabled,
              ]}
            >
              {pairingLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Finalizar vinculación
                </Text>
              )}
            </Pressable>
          ) : null}

          {pairingSession?.status === "PENDING" && !pairingExpired ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Reintentar identificación del Shelly"
              disabled={pairingLoading}
              onPress={() => void retryPairingIdentification()}
              style={[
                styles.retryButton,
                pairingLoading && styles.disabled,
              ]}
            >
              <Text
                style={{
                  color: theme.blue,
                  fontWeight: "700",
                }}
              >
                Reintentar identificación
              </Text>
            </Pressable>
          ) : null}

          {pairingSession && !["COMPLETED", "CANCELLED", "EXPIRED", "FAILED"].includes(pairingSession.status) && !pairingExpired ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancelar vinculación del Shelly"
              disabled={pairingLoading}
              onPress={() => void cancelPairing()}
              style={[
                styles.retryButton,
                pairingLoading && styles.disabled,
              ]}
            >
              <Text
                style={{
                  color: theme.danger,
                  fontWeight: "700",
                }}
              >
                Cancelar vinculación
              </Text>
            </Pressable>
          ) : null}

          {pairingExpired ? (
            <View style={styles.errorSection}>
              <Text
                style={[
                  styles.helperText,
                  { color: theme.danger },
                ]}
              >
                La sesión de vinculación ha expirado.
                Debes iniciar una nueva sesión para continuar.
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Preparar nueva sesión de vinculación"
                onPress={resetExpiredPairing}
                style={styles.retryButton}
              >
                <Text
                  style={{
                    color: theme.blue,
                    fontWeight: "700",
                  }}
                >
                  Preparar nueva vinculación
                </Text>
              </Pressable>
            </View>
          ) : null}

          {pairingError ? (
            <Text style={[styles.helperText, { color: theme.danger }]}>
              {pairingError}
            </Text>
          ) : null}

          {pairingSession?.status !== "COMPLETED" ? (
            <Text style={[styles.pendingNote, { color: theme.muted }]}>
              SmartHome registra el Shelly solo cuando el backend confirma
              su conexión MQTT autenticada. La detección Wi-Fi o una identidad
              MQTT preparada pero deshabilitada no completan la vinculación.
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
