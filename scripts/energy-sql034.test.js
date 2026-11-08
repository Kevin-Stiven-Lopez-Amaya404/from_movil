const assert = require("node:assert/strict");
const test = require("node:test");

const rules = require("../lib/features/energy-sql034/energy-rules");

test("tariff: normalizes comma and dot to the API format", () => {
  assert.deepEqual(rules.normalizeDecimalInput("950,25", "tariff"), {
    ok: true,
    value: "950.25",
  });
  assert.deepEqual(rules.normalizeDecimalInput(" 950.2500 ", "tariff"), {
    ok: true,
    value: "950.2500",
  });
  assert.deepEqual(rules.normalizeDecimalInput("0950", "tariff"), {
    ok: true,
    value: "950",
  });
});

test("tariff: rejects empty, zero, negative, thousands and extra digits", () => {
  assert.equal(rules.normalizeDecimalInput("", "tariff").ok, false);
  assert.equal(rules.normalizeDecimalInput("0", "tariff").ok, false);
  assert.equal(rules.normalizeDecimalInput("0,0000", "tariff").ok, false);
  assert.equal(rules.normalizeDecimalInput("-5", "tariff").ok, false);
  assert.equal(rules.normalizeDecimalInput("1.234,5", "tariff").ok, false);
  assert.equal(rules.normalizeDecimalInput("abc", "tariff").ok, false);
  assert.equal(rules.normalizeDecimalInput("12345678901", "tariff").ok, false);
  assert.equal(rules.normalizeDecimalInput("1.12345", "tariff").ok, false);
  assert.equal(rules.normalizeDecimalInput("1234567890.1234", "tariff").ok, true);
});

test("budget and target: limits 12+2 and 8+6, empty = null", () => {
  assert.equal(rules.normalizeDecimalInput("1.123", "budget").ok, false);
  assert.equal(rules.normalizeDecimalInput("123456789012.12", "budget").ok, true);
  assert.equal(rules.normalizeDecimalInput("123456789", "target").ok, false);
  assert.equal(rules.normalizeDecimalInput("125.123456", "target").ok, true);
  assert.deepEqual(rules.normalizeOptionalDecimalInput("", "budget"), {
    ok: true,
    value: null,
  });
  assert.deepEqual(rules.normalizeOptionalDecimalInput("125", "target"), {
    ok: true,
    value: "125",
  });
});

test("the normalized value is always text, never a number", () => {
  const result = rules.normalizeDecimalInput("950,25", "tariff");
  assert.equal(typeof result.value, "string");
  assert.equal(JSON.stringify({ v: result.value }), '{"v":"950.25"}');
});

test("dates: today and month in Bogota, independent of the device time zone", () => {
  // 2026-11-01 03:00 UTC = 2026-10-31 22:00 in Bogota
  const date = new Date("2026-11-01T03:00:00.000Z");
  assert.equal(rules.todayBogota(date), "2026-10-31");
  assert.equal(rules.currentMonthBogota(date), "2026-10");
});

test("dates: real date and month validation", () => {
  assert.equal(rules.isValidLocalDate("2026-11-01"), true);
  assert.equal(rules.isValidLocalDate("2026-02-30"), false);
  assert.equal(rules.isValidLocalDate("2028-02-29"), true);
  assert.equal(rules.isValidLocalDate("01/11/2026"), false);
  assert.equal(rules.isValidLocalDate("1999-12-31"), false);
  assert.equal(rules.isValidMonth("2026-11"), true);
  assert.equal(rules.isValidMonth("2026-13"), false);
});

test("months: navigation and tariff reference date", () => {
  assert.equal(rules.shiftMonth("2026-12", 1), "2027-01");
  assert.equal(rules.shiftMonth("2026-01", -1), "2025-12");
  assert.equal(rules.lastDayOfMonth("2026-02"), "2026-02-28");
  assert.equal(rules.referenceDateForMonth("2026-11", "2026-11-15"), "2026-11-15");
  assert.equal(rules.referenceDateForMonth("2026-10", "2026-11-15"), "2026-10-31");
  assert.equal(rules.referenceDateForMonth("2026-12", "2026-11-15"), "2026-12-01");
  assert.equal(rules.formatMonthLabel("2026-11"), "noviembre de 2026");
  assert.equal(rules.formatLocalDate("2026-11-01"), "01/11/2026");
});

test("format: COP, kWh, tariff and percentage without losing precision", () => {
  assert.equal(rules.formatCop("120000.00"), "$ 120.000");
  assert.equal(rules.formatCop("25000.50"), "$ 25.000,5");
  assert.equal(rules.formatCop("999999999999.99"), "$ 999.999.999.999,99");
  assert.equal(rules.formatKwh("36.500000"), "36,5 kWh");
  assert.equal(rules.formatKwh("0.005"), "0,01 kWh");
  assert.equal(rules.formatTariff("950.2500"), "$ 950,25 / kWh");
  assert.equal(rules.formatPercent("29.20"), "29,2 %");
  assert.equal(rules.trimDecimalZeros("120000.00"), "120000");
  assert.equal(rules.trimDecimalZeros("125.500000"), "125.5");
});

test("percentages above 100 %: shown in full, the bar is capped", () => {
  assert.equal(rules.formatPercent("135.50"), "135,5 %");
  assert.equal(rules.overLimitPercent("135.50"), "35.50");
  assert.equal(rules.overLimitPercent("100.00"), null);
  assert.equal(rules.overLimitPercent("29.20"), null);
  assert.equal(rules.barWidthPercent("135.50"), 100);
  assert.equal(rules.barWidthPercent("29.20"), 29.2);
  assert.equal(rules.formatPercent("0"), "0 %");
  assert.equal(rules.isValidUsagePercent("0"), true);
  assert.equal(rules.isValidUsagePercent("100.00"), true);
  assert.equal(rules.isValidUsagePercent(null), false);
  assert.equal(rules.isValidUsagePercent("-1"), false);
  assert.equal(rules.isValidUsagePercent("NaN"), false);
  assert.equal(rules.isValidUsagePercent("Infinity"), false);
  assert.equal(rules.barWidthPercent("0"), 0);
  assert.equal(rules.barWidthPercent("-1"), 0);
  assert.equal(rules.barWidthPercent("NaN"), 0);
  assert.equal(rules.barWidthPercent("Infinity"), 0);
  assert.equal(rules.barWidthPercent(null), 0);
});

test("permissions by home role", () => {
  assert.deepEqual(rules.getEnergyAccess("OWNER"), { canRequest: true, canManage: true });
  assert.deepEqual(rules.getEnergyAccess("MEMBER"), { canRequest: true, canManage: false });
  assert.deepEqual(rules.getEnergyAccess("GUEST"), { canRequest: false, canManage: false });
  assert.deepEqual(rules.getEnergyAccess(undefined), { canRequest: false, canManage: false });
});

test("errors: backend business codes", () => {
  assert.match(
    rules.energyErrorMessage({ status: 409, serverCode: "ENERGY_TARIFF_DUPLICATE" }),
    /Ya existe una tarifa/,
  );
  assert.match(
    rules.energyErrorMessage({ status: 409, serverCode: "ENERGY_GOAL_CONCURRENT_WRITE" }),
    /otra sesión/,
  );
  assert.match(
    rules.energyErrorMessage({ status: 400, serverCode: "ENERGY_GOAL_VALUE_REQUIRED" }),
    /presupuesto, la meta/,
  );
  assert.match(
    rules.energyErrorMessage({ status: 403, serverCode: "ENERGY_MANAGE_FORBIDDEN" }),
    /Solo el propietario/,
  );
  assert.match(rules.energyErrorMessage({ code: "NETWORK_ERROR" }), /conexión/);
  assert.match(rules.energyErrorMessage({ status: 503 }), /servidor/);
  assert.match(rules.energyErrorMessage({ status: 404 }), /aún no está disponible/);
  assert.equal(rules.energyErrorMessage({ status: 400, message: "dato inválido" }), "dato inválido");
  assert.equal(rules.isForbiddenError({ status: 403 }), true);
  assert.equal(rules.isForbiddenError({ status: 409 }), false);
});
