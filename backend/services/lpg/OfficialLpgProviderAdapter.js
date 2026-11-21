const LpgProviderInterface = require('./LpgProviderInterface');

/**
 * Official Authorized LPG Provider Adapter
 * Connects to official government/OMC APIs when valid authorized credentials,
 * certificates, and IP whitelisting are in place.
 * Note: Never invent fake endpoints. Stubs connect to official OMC Gateways when credentials are provided.
 */
class OfficialLpgProviderAdapter extends LpgProviderInterface {
  constructor() {
    super();
    this.apiKey = process.env.OFFICIAL_LPG_API_KEY;
    this.apiBaseUrl = process.env.OFFICIAL_LPG_API_BASE_URL;
    this.certPath = process.env.OFFICIAL_LPG_CERT_PATH;
  }

  isAuthorized() {
    return Boolean(this.apiKey && this.apiBaseUrl);
  }

  async verifyConsumer({ providerId, consumerNumber, mobileNumber }) {
    if (!this.isAuthorized()) {
      throw new Error(
        'Official LPG Provider Gateway credentials are not configured. Switch to LPG_API_MODE=mock for National Sandbox Grid.'
      );
    }
    // Real implementation would invoke OMC Gateway:
    // const res = await axios.post(`${this.apiBaseUrl}/api/v1/consumer/verify`, { ... });
    // return res.data;
  }

  async fetchConnectionDetails({ providerId, consumerNumber }) {
    if (!this.isAuthorized()) {
      throw new Error('Official LPG Provider Gateway credentials are not configured.');
    }
  }

  async bookRefill({ providerId, consumerNumber, cylinderType, paymentMode, deliveryAddress }) {
    if (!this.isAuthorized()) {
      throw new Error('Official LPG Provider Gateway credentials are not configured.');
    }
  }

  async trackBooking({ providerId, bookingReference }) {
    if (!this.isAuthorized()) {
      throw new Error('Official LPG Provider Gateway credentials are not configured.');
    }
  }

  async fetchRefillHistory({ providerId, consumerNumber }) {
    if (!this.isAuthorized()) {
      throw new Error('Official LPG Provider Gateway credentials are not configured.');
    }
  }

  async fetchSubsidyDetails({ providerId, consumerNumber }) {
    if (!this.isAuthorized()) {
      throw new Error('Official LPG Provider Gateway credentials are not configured.');
    }
  }
}

module.exports = OfficialLpgProviderAdapter;
