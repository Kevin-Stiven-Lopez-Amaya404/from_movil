const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const src = fs.readFileSync(path.join(__dirname,'../lib/pairing/shelly-mqtt-bootstrap-validation.ts'),'utf8');
const js = ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const mod={exports:{}};
new Function('require','module','exports',js)(require,mod,mod.exports);
const validate=mod.exports.assertValidMqttBootstrapResponse;
const op='42d8c2da-4701-4faa-87ac-e279b3854de5';
const host='mqtt-dev.179-236-82-122.sslip.io';
const sample=expiresAt=>({phase:'PROVISIONING_AUTHORIZED',mqttAuthenticated:false,identity:{username:'unused'},broker:{hostname:host,port:443},expiresAt});
const now=Date.parse('2026-10-28T10:00:00Z');
test('accepts a 120-second TTL with a small clock drift',()=>{
 assert.doesNotThrow(()=>validate(sample(new Date(now+155000).toISOString()),op,host,443,now));
});
test('rejects expiry and excessive TTL or drift',()=>{
 assert.throws(()=>validate(sample(new Date(now-1).toISOString()),op,host,443,now),/EXPIRED/);
 assert.throws(()=>validate(sample(new Date(now+181000).toISOString()),op,host,443,now),/CLOCK_SKEW/);
});
test('rejects a broker or contract change',()=>{
 assert.throws(()=>validate({...sample(new Date(now+120000).toISOString()),broker:{hostname:'evil.invalid',port:443}},op,host,443,now),/BROKER_MISMATCH/);
 assert.throws(()=>validate({...sample(new Date(now+120000).toISOString()),mqttAuthenticated:true},op,host,443,now),/ENVELOPE_INVALID/);
});
