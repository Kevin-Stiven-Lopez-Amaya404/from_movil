const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const sourcePath = path.join(__dirname, "../lib/pairing/shelly-gatt-rpc.ts");
const source = fs.readFileSync(sourcePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const loaded = { exports: {} };
const localRequire = (name) => {
  if (name === "./pairing-types") {
    return {
      PairingError: class PairingError extends Error {
        constructor(message, code) {
          super(message);
          this.code = code;
        }
      },
    };
  }
  return require(name);
};
new Function("require", "module", "exports", compiled)(localRequire, loaded, loaded.exports);
const { decodeShellyRpcResponse, encodeShellyRpcFrame, readShellyDeviceInfo } = loaded.exports;

function base64(bytes) {
  return Buffer.from(bytes).toString("base64");
}

function fromBase64(value) {
  return Uint8Array.from(Buffer.from(value, "base64"));
}

async function testReadOnlyDeviceInfo() {
  let expectedRequestLength = 0;
  let requestBytes = [];
  let responseBytes = new Uint8Array();
  let responseOffset = 0;
  let rxListener;
  let disconnected = false;
  const ble = {
    async connectToDevice(id) {
      assert.equal(id, "test-shelly");
      return { id, async discoverAllServicesAndCharacteristics() { return this; } };
    },
    async cancelDeviceConnection() {
      disconnected = true;
      return { id: "test-shelly" };
    },
    async requestMTUForDevice(_id, requested) {
      assert.equal(requested, 247);
      return { mtu: 23 };
    },
    monitorCharacteristicForService(_service, _characteristic, listener) {
      rxListener = listener;
      return { remove() {} };
    },
    async writeCharacteristicWithResponseForService(_service, characteristic, value) {
      const bytes = fromBase64(value);
      if (characteristic.endsWith("785f63746c5f")) {
        expectedRequestLength = new DataView(bytes.buffer).getUint32(0, false);
      } else {
        requestBytes = requestBytes.concat([...bytes]);
        if (requestBytes.length === expectedRequestLength) {
          const request = JSON.parse(Buffer.from(requestBytes).toString("utf8"));
          const response = JSON.stringify({
            id: request.id,
            src: "shelly-test",
            result: {
              mac: "AA:BB:CC:DD:EE:FF",
              model: "S4SW-001P16EU",
              fw_id: "test-build",
              provision: "pending",
            },
          });
          responseBytes = Uint8Array.from(Buffer.from(response, "utf8"));
          rxListener(null, { value: base64(new Uint8Array([
            (responseBytes.length >>> 24) & 255,
            (responseBytes.length >>> 16) & 255,
            (responseBytes.length >>> 8) & 255,
            responseBytes.length & 255,
          ])) });
        }
      }
      return { value };
    },
    async readCharacteristicForService() {
      const chunk = responseBytes.subarray(responseOffset, responseOffset + 20);
      responseOffset += chunk.length;
      return { value: base64(chunk) };
    },
  };

  const result = await readShellyDeviceInfo(ble, "test-shelly");
  assert.equal(result.model, "S4SW-001P16EU");
  assert.equal(result.provision, "pending");
  assert.ok(requestBytes.length > 20, "request should be chunked using default MTU");
  assert.equal(disconnected, true, "connection must be closed after inspection");
}

async function main() {
  const frame = encodeShellyRpcFrame('{"method":"Shelly.GetDeviceInfo"}');
  assert.equal(Buffer.from(frame).toString("utf8"), '{"method":"Shelly.GetDeviceInfo"}');
  assert.throws(() => encodeShellyRpcFrame("x".repeat(4097)));
  const response = Uint8Array.from(Buffer.from('{"id":7,"result":{"model":"S4SW-001P16EU"}}'));
  assert.equal(decodeShellyRpcResponse(response, 7).model, "S4SW-001P16EU");
  assert.throws(() => decodeShellyRpcResponse(response, 8), /Shelly rechazó/);
  await testReadOnlyDeviceInfo();
}

main().then(() => {
  process.stdout.write("✔ GATT RPC validates framing, response IDs, and closes after read-only inspection\n");
}).catch((error) => {
  process.stderr.write(`${error.stack || error}\n`);
  process.exitCode = 1;
});
