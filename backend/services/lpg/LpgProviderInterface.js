/**
 * LPG Provider Interface (Base Adapter Contract)
 * Defines standard operations required for all LPG OMC providers (Indane, Bharat Gas, HP Gas).
 * All concrete adapters (Mock Sandbox, Official OMC Gateway, UMANG) must implement this interface.
 */
class LpgProviderInterface {
  /**
   * Verify consumer existence and phone number match
   * @param {Object} params
   * @param {string} params.providerId - 'indane' | 'bharat_gas' | 'hp_gas'
   * @param {string} params.consumerNumber - e.g. 'IND-7009412'
   * @param {string} params.mobileNumber - 10-digit registered mobile
   */
  async verifyConsumer({ providerId, consumerNumber, mobileNumber }) {
    throw new Error('Method verifyConsumer() must be implemented.');
  }

  /**
   * Fetch complete connection details from LPG Grid
   * @param {Object} params
   * @param {string} params.providerId
   * @param {string} params.consumerNumber
   */
  async fetchConnectionDetails({ providerId, consumerNumber }) {
    throw new Error('Method fetchConnectionDetails() must be implemented.');
  }

  /**
   * Submit Refill Booking request
   * @param {Object} params
   * @param {string} params.providerId
   * @param {string} params.consumerNumber
   * @param {string} params.cylinderType
   * @param {string} params.paymentMode
   */
  async bookRefill({ providerId, consumerNumber, cylinderType, paymentMode, deliveryAddress }) {
    throw new Error('Method bookRefill() must be implemented.');
  }

  /**
   * Track Booking Status
   * @param {Object} params
   * @param {string} params.providerId
   * @param {string} params.bookingReference
   */
  async trackBooking({ providerId, bookingReference }) {
    throw new Error('Method trackBooking() must be implemented.');
  }

  /**
   * Fetch Refill History
   * @param {Object} params
   * @param {string} params.providerId
   * @param {string} params.consumerNumber
   */
  async fetchRefillHistory({ providerId, consumerNumber }) {
    throw new Error('Method fetchRefillHistory() must be implemented.');
  }

  /**
   * Fetch Direct Benefit Transfer (DBTL) Subsidy details
   * @param {Object} params
   * @param {string} params.providerId
   * @param {string} params.consumerNumber
   */
  async fetchSubsidyDetails({ providerId, consumerNumber }) {
    throw new Error('Method fetchSubsidyDetails() must be implemented.');
  }
}

module.exports = LpgProviderInterface;
