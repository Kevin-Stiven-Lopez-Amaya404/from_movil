/**
 * Pure SQL034 rules for mobile: decimal validation, Bogota dates,
 * display format, permissions by role and error messages.
 *
 * Written in JavaScript (with energy-rules.d.ts) so it can be tested with
 * `node --test`, like lib/navigation/auth-route-policy.js.
 * Money and kWh are ALWAYS handled as text; never with Number.
 */

const TIMEZONE = "America/Bogota";
const MIN_YEAR = 2000;
const MAX_YEAR = 2099;

const MONTH_NAMES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** Backend limits: integer and decimal digits allowed per field. */
const DECIMAL_LIMITS = {
  tariff: { integer: 10, scale: 4 },
  budget: { integer: 12, scale: 2 },
  target: { integer: 8, scale: 6 },
};

// ---------------------------------------------------------------------------
// Fechas (calendario America/Bogota)
// ---------------------------------------------------------------------------

function bogotaParts(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date || new Date());
  const get = (type) => {
    const part = parts.find((item) => item.type === type);
    return part ? part.value : "";
  };
  return { year: get("year"), month: get("month"), day: get("day") };
}

/** Today in Bogota as YYYY-MM-DD (without toISOString). */
function todayBogota(date) {
  const p = bogotaParts(date);
  return `${p.year}-${p.month}-${p.day}`;
}

/** Current month in Bogota as YYYY-MM. */
function currentMonthBogota(date) {
  const p = bogotaParts(date);
  return `${p.year}-${p.month}`;
}

function isValidMonth(value) {
  if (typeof value !== "string") return false;
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  return year >= MIN_YEAR && year <= MAX_YEAR;
}

function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Validates a real YYYY-MM-DD date (rejects 2026-02-30). */
function isValidLocalDate(value) {
  if (typeof value !== "string") return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < MIN_YEAR || year > MAX_YEAR) return false;
  if (month < 1 || month > 12 || day < 1) return false;
  return day <= daysInMonth(year, month);
}

/** Adds or subtracts months from a YYYY-MM. */
function shiftMonth(month, delta) {
  const [year, monthNumber] = month.split("-").map(Number);
  const total = year * 12 + (monthNumber - 1) + delta;
  const newYear = Math.floor(total / 12);
  const newMonth = (total % 12) + 1;
  return `${newYear}-${String(newMonth).padStart(2, "0")}`;
}

function lastDayOfMonth(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  return `${month}-${String(daysInMonth(year, monthNumber)).padStart(2, "0")}`;
}

/**
 * Date used to query the tariff effective in a month:
 * current month -> today; past month -> last day; future month -> first day.
 */
function referenceDateForMonth(month, today) {
  const todayValue = today || todayBogota();
  const current = todayValue.slice(0, 7);
  if (month === current) return todayValue;
  if (month < current) return lastDayOfMonth(month);
  return `${month}-01`;
}

/** "2026-11" -> "noviembre de 2026" */
function formatMonthLabel(month) {
  if (!isValidMonth(month)) return month;
  const [year, monthNumber] = month.split("-").map(Number);
  return `${MONTH_NAMES[monthNumber - 1]} de ${year}`;
}

/** "2026-11-01" -> "01/11/2026" */
function formatLocalDate(value) {
  if (typeof value !== "string" || value.length < 10) return value;
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

/** UTC ISO -> "01/11/2026" in Bogota */
function formatIsoDateBogota(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return formatLocalDate(todayBogota(date));
}

// ---------------------------------------------------------------------------
// Decimals as text
// ---------------------------------------------------------------------------

/**
 * Converts the user's input to the API format ("950.25").
 * Accepts a single decimal separator (comma or dot) and no thousands
 * separators, so there are no ambiguous values.
 * Returns { ok: true, value } or { ok: false, empty, error }.
 */
function normalizeDecimalInput(raw, kind) {
  const limits = DECIMAL_LIMITS[kind];
  const text = String(raw == null ? "" : raw).trim().replace(/\s+/g, "");

  if (text === "") {
    return { ok: false, empty: true, error: "Este campo es obligatorio." };
  }
  if (text.startsWith("-")) {
    return { ok: false, empty: false, error: "No se permiten valores negativos." };
  }

  const separators = text.match(/[.,]/g) || [];
  if (separators.length > 1) {
    return {
      ok: false,
      empty: false,
      error:
        "Usa un solo separador decimal (coma o punto) y no escribas separadores de miles.",
    };
  }

  const normalized = text.replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return { ok: false, empty: false, error: "Escribe solo números." };
  }

  let [integerPart, decimalPart = ""] = normalized.split(".");
  integerPart = integerPart.replace(/^0+(?=\d)/, "");

  if (!/[1-9]/.test(integerPart + decimalPart)) {
    return { ok: false, empty: false, error: "Debe ser mayor que cero." };
  }
  if (integerPart.length > limits.integer) {
    return {
      ok: false,
      empty: false,
      error: `Máximo ${limits.integer} dígitos enteros.`,
    };
  }
  if (decimalPart.length > limits.scale) {
    return {
      ok: false,
      empty: false,
      error: `Máximo ${limits.scale} decimales.`,
    };
  }

  return {
    ok: true,
    value: decimalPart ? `${integerPart}.${decimalPart}` : integerPart,
  };
}

/** Same as normalizeDecimalInput, but empty is valid and returns null. */
function normalizeOptionalDecimalInput(raw, kind) {
  const text = String(raw == null ? "" : raw).trim();
  if (text === "") return { ok: true, value: null };
  return normalizeDecimalInput(text, kind);
}

/** "120000.00" -> "120000"; "125.500000" -> "125.5" (to prefill forms). */
function trimDecimalZeros(value) {
  if (value == null) return "";
  const text = String(value);
  if (!text.includes(".")) return text;
  return text.replace(/0+$/, "").replace(/\.$/, "");
}

/**
 * Rounds a decimal string to `places` decimals (half up),
 * using BigInt to avoid losing precision.
 */
function roundDecimalString(value, places) {
  const text = String(value);
  const negative = text.startsWith("-");
  const unsigned = negative ? text.slice(1) : text;
  const [integerPart, decimalPart = ""] = unsigned.split(".");
  if (decimalPart.length <= places) {
    return { integer: integerPart, decimals: decimalPart.padEnd(places, "0"), negative };
  }
  let digits = BigInt(integerPart + decimalPart.slice(0, places));
  if (Number(decimalPart[places]) >= 5) digits += BigInt(1);
  const padded = digits.toString().padStart(places + 1, "0");
  return {
    integer: places ? padded.slice(0, -places) : padded,
    decimals: places ? padded.slice(-places) : "",
    negative,
  };
}

function groupThousands(integer) {
  return integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Colombian display format: thousands with a dot, decimals with a comma,
 * trailing zeros removed. E.g. ("25000.50", 2) -> "25.000,5".
 */
function formatDecimalEsCo(value, maxDecimals) {
  if (value == null || value === "") return "—";
  const rounded = roundDecimalString(value, maxDecimals);
  const decimals = rounded.decimals.replace(/0+$/, "");
  const body = groupThousands(rounded.integer) + (decimals ? `,${decimals}` : "");
  return rounded.negative ? `-${body}` : body;
}

function formatCop(value) {
  if (value == null) return "—";
  return `$ ${formatDecimalEsCo(value, 2)}`;
}

function formatKwh(value) {
  if (value == null) return "—";
  return `${formatDecimalEsCo(value, 2)} kWh`;
}

function formatTariff(value) {
  if (value == null) return "—";
  return `$ ${formatDecimalEsCo(value, 4)} / kWh`;
}

function formatPercent(value) {
  if (value == null) return "—";
  return `${formatDecimalEsCo(value, 1)} %`;
}

function isValidUsagePercent(value) {
  return typeof value === "string" && /^\d+(?:\.\d+)?$/.test(value);
}

/** How much 100 % is exceeded (text). null if it is not exceeded. */
function overLimitPercent(value) {
  if (value == null) return null;
  const [integerPart, decimalPart = ""] = String(value).split(".");
  const scaled = BigInt(integerPart + decimalPart.padEnd(2, "0").slice(0, 2));
  const over = scaled - BigInt(10000);
  if (over <= BigInt(0)) return null;
  const text = over.toString().padStart(3, "0");
  return `${text.slice(0, -2)}.${text.slice(-2)}`;
}

/** Visual width of the bar (0..100). The displayed number is NOT capped. */
function barWidthPercent(value) {
  if (value == null) return 0;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return 0;
  return Math.min(100, number);
}

// ---------------------------------------------------------------------------
// Permissions (the backend is the final authority: always handle 403)
// ---------------------------------------------------------------------------

/**
 * OWNER: reads and manages. MEMBER: can read if the backend answers
 * 200 (view_consumption permission); if it answers 403 it is hidden. GUEST: nothing.
 */
function getEnergyAccess(homeRole) {
  if (homeRole === "OWNER") return { canRequest: true, canManage: true };
  if (homeRole === "MEMBER") return { canRequest: true, canManage: false };
  return { canRequest: false, canManage: false };
}

// ---------------------------------------------------------------------------
// Errores
// ---------------------------------------------------------------------------

function isForbiddenError(error) {
  return Boolean(error) && (error.status === 403 || error.code === "FORBIDDEN");
}

function energyErrorMessage(error) {
  if (!error) return "No se pudo completar la solicitud.";

  switch (error.serverCode) {
    case "ENERGY_TARIFF_DUPLICATE":
      return "Ya existe una tarifa con esa fecha de vigencia. Elige otra fecha.";
    case "ENERGY_GOAL_VALUE_REQUIRED":
      return "Debes indicar el presupuesto, la meta de kWh o ambos.";
    case "ENERGY_GOAL_CONCURRENT_WRITE":
      return "La configuración de este mes cambió en otra sesión. Revisa los datos actualizados e inténtalo de nuevo.";
    case "ENERGY_MANAGE_FORBIDDEN":
      return "Solo el propietario del hogar puede cambiar esta configuración.";
    case "ENERGY_READ_FORBIDDEN":
      return "No tienes permiso para ver la información económica de este hogar.";
    default:
      break;
  }

  if (error.code === "NETWORK_ERROR") {
    return "No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.";
  }
  if (error.status === 404) {
    return "Esta función aún no está disponible en el servidor.";
  }
  if (typeof error.status === "number" && error.status >= 500) {
    return "El servidor no pudo responder. Inténtalo de nuevo.";
  }
  if (error.status === 403) {
    return "Solo el propietario del hogar puede cambiar esta configuración.";
  }
  return error.message || "No se pudo completar la solicitud.";
}

module.exports = {
  TIMEZONE,
  todayBogota,
  currentMonthBogota,
  isValidMonth,
  isValidLocalDate,
  shiftMonth,
  lastDayOfMonth,
  referenceDateForMonth,
  formatMonthLabel,
  formatLocalDate,
  formatIsoDateBogota,
  normalizeDecimalInput,
  normalizeOptionalDecimalInput,
  trimDecimalZeros,
  formatDecimalEsCo,
  formatCop,
  formatKwh,
  formatTariff,
  formatPercent,
  isValidUsagePercent,
  overLimitPercent,
  barWidthPercent,
  getEnergyAccess,
  isForbiddenError,
  energyErrorMessage,
};
