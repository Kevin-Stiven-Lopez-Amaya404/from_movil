// Pruebas sin red, sin credenciales reales, sin Shelly fisico.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const file = path.join(root, 'lib', 'pairing', 'shelly-mqtt-local-provisioning.ts');
// Adaptador de require solo para estas pruebas; el build Expo usa su propio bundler.
const originalTs = require.extensions['.ts'];
require.extensions['.ts'] = function(m, filename) {
  const input = fs.readFileSync(filename, 'utf8');
  const js = ts.transpileModule(input, {compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  }}).outputText;
  m._compile(js, filename);
};
let identityCalls = 0;
// Sustituye el modulo de identidad por una respuesta fisica simulada.
const identityFile = path.join(root, 'lib', 'pairing', 'shelly-local-identity.ts');
const identityStub = new Module(identityFile);
identityStub.filename = identityFile;
identityStub.loaded = true;
identityStub.exports = {
  isPrivateIpv4: (ip) => /^192\.168\.1\.\d{1,3}$/.test(ip),
  readShellyLocalIdentity: async () => {
    identityCalls += 1;
    return {manufacturerDeviceId: 'shelly1pmg4-aabbcc', modelCode: 'S4SW-001P16EU', generation: 4};
  },
};
require.cache[identityFile] = identityStub;
const {configureShellyMqttLocally, readShellyMqttStatus} = require(file);
const client = '0'.repeat(32);
const example = () => ({
  ip: '192.168.1.10', expectedDeviceId:'shelly1pmg4-aabbcc',
  explicitlyTrustedLocalNetwork:true,
  authorization: {
    phase:'PROVISIONING_AUTHORIZED', mqttAuthenticated:false,
    manufacturerDeviceId:'shelly1pmg4-aabbcc',
    expiresAt:new Date(Date.now()+60_000).toISOString(),
    broker:{hostname:'mqtt-dev.179-236-82-122.sslip.io',port:443,caPem:'-----BEGIN CERTIFICATE-----\n'+('A'.repeat(700))+'\n-----END CERTIFICATE-----\n'},
    identity:{username:'shd_'+client,clientId:'shd-'+client,password:'P'.repeat(43),topicPrefix:'smarthome/devices/shelly1pmg4-aabbcc'},
  },
});

test('sin aprobacion explicita de LAN confiable no hace llamadas',async()=>{
  const calls=[];
  await assert.rejects(configureShellyMqttLocally({...example(),explicitlyTrustedLocalNetwork:false}, async (...x)=>calls.push(x)), /TRUST_REQUIRED/);
  assert.equal(calls.length,0);
});

test('sin autorizacion vigente no hace llamadas',async()=>{
  const calls=[]; const payload=example();payload.authorization.expiresAt='2020-01-01T00:00:00Z';
  await assert.rejects(configureShellyMqttLocally(payload,async(...x)=>calls.push(x)),/AUTHORIZATION_INVALID/);
  assert.equal(calls.length,0);
});

test('no permite broker ni scope arbitrario',async()=>{
  const wrong=example();wrong.authorization.identity.topicPrefix='otro/espacio';
  await assert.rejects(configureShellyMqttLocally(wrong,async()=>{}),/IDENTITY_INVALID/);
});

test('rechaza un broker distinto al DEV autorizado antes de llamar al Shelly',async()=>{
  const wrong=example();wrong.authorization.broker.hostname='broker.invalid';
  const calls=[];
  await assert.rejects(configureShellyMqttLocally(wrong,async(...x)=>calls.push(x)),/BROKER_INVALID/);
  assert.equal(calls.length,0);
});

test('envia CA fragmentada, configura TLS y verifica readback; no declara autenticado',async()=>{
  const calls=[];
  let uploadedLength=0;
  const rpc=async (ip,method,params)=>{
    calls.push({ip,method,params});
    if(method==='Shelly.PutUserCA') {
      uploadedLength += params.data.length;
      return {len: uploadedLength};
    }
    if(method==='MQTT.SetConfig')return {restart_required:true};
    if(method==='Shelly.Reboot')return null;
    if(method==='MQTT.GetConfig')return {
      enable:true,server:'mqtt-dev.179-236-82-122.sslip.io:443',client_id:'shd-'+client,
      user:'shd_'+client,ssl_ca:'user_ca.pem',use_client_cert:false,
      topic_prefix:'smarthome/devices/shelly1pmg4-aabbcc',
    };
    if(method==='MQTT.GetStatus')return {connected:false};
  };
  const result=await configureShellyMqttLocally(example(),rpc,async()=>{});
  assert.equal(result.phase,'CONFIGURED_LOCALLY_UNVERIFIED');
  assert.equal(result.mqttAuthenticated,false);
  assert.equal(result.mqttConnected,false);
  assert.equal(result.restartRequired,true);
  assert.equal(calls.filter(x=>x.method==='Shelly.PutUserCA').length,2);
  assert.equal(calls[0].params.append,false);
  assert.equal(calls[1].params.append,true);
  assert.equal(calls[2].params.config.ssl_ca,'user_ca.pem');
  assert.equal(calls[2].params.config.server,'mqtt-dev.179-236-82-122.sslip.io:443');
  assert.equal(calls[2].params.config.use_client_cert,false);
  assert.equal(calls[2].params.config.pass,'P'.repeat(43));
  assert.equal(calls.filter(x=>x.method==='Shelly.Reboot').length,1);
  assert.deepEqual(calls.map(x=>x.method).slice(-4),[
    'MQTT.GetConfig','Shelly.Reboot','MQTT.GetConfig','MQTT.GetStatus',
  ]);
  assert.ok(identityCalls>0);
});

test('estado conectado local no equivale a autenticacion del backend',async()=>{
  const status=await readShellyMqttStatus({
    ip:'192.168.1.10',expectedDeviceId:'shelly1pmg4-aabbcc',
  },async(_ip,method)=>{
    assert.equal(method,'MQTT.GetStatus');
    return {connected:true};
  });
  assert.deepEqual(status,{connected:true});
});

test('respuesta incierta de reinicio no reenvia escritura ni reinicio',async()=>{
  const calls=[];
  let uploadedLength=0;
  const rpc=async(_ip,method,params)=>{
    calls.push(method);
    if(method==='Shelly.PutUserCA') {
      uploadedLength += params.data.length;
      return {len:uploadedLength};
    }
    if(method==='MQTT.SetConfig')return {restart_required:true};
    if(method==='MQTT.GetConfig')return {
      enable:true,server:'mqtt-dev.179-236-82-122.sslip.io:443',
      client_id:'shd-'+client,user:'shd_'+client,ssl_ca:'user_ca.pem',
      use_client_cert:false,topic_prefix:'smarthome/devices/shelly1pmg4-aabbcc',
    };
    if(method==='Shelly.Reboot')throw new Error('SHELLY_RPC_OUTCOME_UNCERTAIN');
  };
  await assert.rejects(configureShellyMqttLocally(example(),rpc),/OUTCOME_UNCERTAIN/);
  assert.equal(calls.filter(method=>method==='MQTT.SetConfig').length,1);
  assert.equal(calls.filter(method=>method==='Shelly.Reboot').length,1);
});

test('resultado RPC incierto impide declarar configuracion exitosa',async()=>{
  let uploadedLength=0;
  const rpc=async(_ip,method,params)=> {
    if(method==='Shelly.PutUserCA') {
      uploadedLength += params.data.length;
      return {len:uploadedLength};
    }
    if(method==='MQTT.SetConfig')return {restart_required:true};
    return {enable:false};
  };
  await assert.rejects(configureShellyMqttLocally(example(),rpc),/READBACK_MISMATCH/);
});
if(originalTs)require.extensions['.ts']=originalTs;
