const MockLpgProviderAdapter = require('./MockLpgProviderAdapter');
const OfficialLpgProviderAdapter = require('./OfficialLpgProviderAdapter');

const mode = process.env.LPG_API_MODE || 'mock';

let adapterInstance;

if (mode === 'official') {
  adapterInstance = new OfficialLpgProviderAdapter();
  console.log('⚡ [LPG Gateway] Running with Official Authorized LPG Provider Adapter');
} else {
  adapterInstance = new MockLpgProviderAdapter();
  console.log('🛡️ [LPG Gateway] Running with Mock National LPG Grid Sandbox Adapter (Indane / Bharat Gas / HP Gas)');
}

module.exports = adapterInstance;
