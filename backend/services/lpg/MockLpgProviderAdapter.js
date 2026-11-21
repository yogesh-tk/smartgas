const LpgProviderInterface = require('./LpgProviderInterface');

/**
 * Mock LPG Provider Adapter (National LPG Grid Sandbox)
 * Provides realistic simulated data for Indian Oil (Indane), BPCL (Bharat Gas), and HPCL (HP Gas).
 * Clearly marked with simulation badges and disclaimer headers.
 */
class MockLpgProviderAdapter extends LpgProviderInterface {
  constructor() {
    super();
    this.dataSourceNotice = 'Simulated National LPG Grid Sandbox Data - Bharat Scheme';

    // In-memory catalog of realistic simulated consumers
    this.mockRegistry = {
      // 1. Indane Gas (IOCL)
      'indane:IND-7009412': {
        providerId: 'indane',
        providerName: 'Indane Gas (IOCL)',
        consumerNumber: 'IND-7009412',
        maskedConsumerNumber: 'IND-***-9412',
        lpgId17Digit: '17000010928374619',
        registeredMobile: '9876543210',
        maskedMobile: '98****3210',
        consumerName: 'Anandan Selvaraj',
        connectionStatus: 'active',
        cylinderType: '14.2kg',
        distributorCode: 'IND-CHE-09',
        distributorName: 'Sri Meenakshi Indane Vitrak',
        distributorPhone: '044-26154321',
        deliveryAddress: 'Flat 4B, Kaveri Towers, Anna Nagar West, Chennai - 600040',
        district: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600040',
        subsidyEligible: true,
        subsidyScheme: 'PAHAL (DBTL) / PMUY',
        bankName: 'State Bank of India',
        maskedBankAcc: 'XXXX-XXXX-4819',
        ifscCode: 'SBIN0004128',
        aadhaarLinked: true,
        maskedAadhaar: 'XXXX-XXXX-5521',
        securityDeposit: 1450.00,
        connectionDate: '2021-08-15',
        lastBookingDate: '2026-11-19T10:30:00Z',
        lastDeliveryDate: '2026-10-18T14:20:00Z',
        currentBookingStatus: 'out_for_delivery',
      },

      // 2. Bharat Gas (BPCL)
      'bharat_gas:BHT-5541908': {
        providerId: 'bharat_gas',
        providerName: 'Bharat Gas (BPCL)',
        consumerNumber: 'BHT-5541908',
        maskedConsumerNumber: 'BHT-***-1908',
        lpgId17Digit: '18000030918237465',
        registeredMobile: '9876543211',
        maskedMobile: '98****3211',
        consumerName: 'Selvaraj Muthu (Father)',
        connectionStatus: 'active',
        cylinderType: '14.2kg',
        distributorCode: 'BHT-MDU-14',
        distributorName: 'Pandian Bharat Gas Agency',
        distributorPhone: '0452-2531980',
        deliveryAddress: '12/4 East Veli Street, Simmakkal, Madurai - 625001',
        district: 'Madurai',
        state: 'Tamil Nadu',
        pincode: '625001',
        subsidyEligible: true,
        subsidyScheme: 'PAHAL (DBTL)',
        bankName: 'Canara Bank',
        maskedBankAcc: 'XXXX-XXXX-9902',
        ifscCode: 'CNRB0001928',
        aadhaarLinked: true,
        maskedAadhaar: 'XXXX-XXXX-8910',
        securityDeposit: 1450.00,
        connectionDate: '2019-03-20',
        lastBookingDate: '2026-11-06T09:15:00Z',
        lastDeliveryDate: '2026-11-08T16:45:00Z',
        currentBookingStatus: 'delivered',
      },

      // 3. HP Gas (HPCL)
      'hp_gas:HP-9902184': {
        providerId: 'hp_gas',
        providerName: 'HP Gas (HPCL)',
        consumerNumber: 'HP-9902184',
        maskedConsumerNumber: 'HP-***-2184',
        lpgId17Digit: '19000050819203847',
        registeredMobile: '9876543212',
        maskedMobile: '98****3212',
        consumerName: 'Kavitha Anandan',
        connectionStatus: 'active',
        cylinderType: '14.2kg',
        distributorCode: 'HP-CBE-07',
        distributorName: 'Kovai Sri Krishna HP Gas Agency',
        distributorPhone: '0422-2490182',
        deliveryAddress: '28 Gandhipuram 4th Street, Coimbatore - 641012',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        pincode: '641012',
        subsidyEligible: true,
        subsidyScheme: 'PAHAL (DBTL)',
        bankName: 'Indian Overseas Bank',
        maskedBankAcc: 'XXXX-XXXX-1142',
        ifscCode: 'IOBA0000412',
        aadhaarLinked: true,
        maskedAadhaar: 'XXXX-XXXX-3341',
        securityDeposit: 1450.00,
        connectionDate: '2022-11-10',
        lastBookingDate: '2026-10-25T11:00:00Z',
        lastDeliveryDate: '2026-10-27T15:30:00Z',
        currentBookingStatus: 'delivered',
      },
    };
  }

  /**
   * Helper to format masked consumer number
   */
  maskConsumerNo(consumerNo) {
    if (!consumerNo) return '';
    if (consumerNo.length <= 4) return '***' + consumerNo;
    const prefix = consumerNo.slice(0, 3);
    const suffix = consumerNo.slice(-4);
    return `${prefix}-***-${suffix}`;
  }

  /**
   * Generate or retrieve mock consumer record
   */
  getOrCreateConsumer(providerId, consumerNumber, mobileNumber = '9876543210') {
    const key = `${providerId}:${consumerNumber.toUpperCase()}`;
    if (this.mockRegistry[key]) {
      return this.mockRegistry[key];
    }

    // Dynamically generate realistic simulated record for any custom number entered
    const pCode = providerId === 'indane' ? 'IND' : providerId === 'bharat_gas' ? 'BHT' : 'HP';
    const distNames = {
      indane: 'Sri Meenakshi Indane Vitrak',
      bharat_gas: 'Kaveri Bharat Gas Agency',
      hp_gas: 'Tamil Nadu HP Gas Services',
    };

    const newRecord = {
      providerId,
      providerName: providerId === 'indane' ? 'Indane Gas (IOCL)' : providerId === 'bharat_gas' ? 'Bharat Gas (BPCL)' : 'HP Gas (HPCL)',
      consumerNumber: consumerNumber.toUpperCase(),
      maskedConsumerNumber: this.maskConsumerNo(consumerNumber),
      lpgId17Digit: `170000${Math.floor(10000000000 + Math.random() * 90000000000)}`,
      registeredMobile: mobileNumber,
      maskedMobile: mobileNumber.slice(0, 2) + '****' + mobileNumber.slice(-4),
      consumerName: 'Verified Citizen (Govt LPG Record)',
      connectionStatus: 'active',
      cylinderType: '14.2kg',
      distributorCode: `${pCode}-TN-DIST-${Math.floor(100 + Math.random() * 900)}`,
      distributorName: distNames[providerId] || 'Authorized OMC Gas Agency',
      distributorPhone: '044-22334455',
      deliveryAddress: 'Plot 104, Bharathi Nagar 2nd Main Road, Chennai - 600028',
      district: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600028',
      subsidyEligible: true,
      subsidyScheme: 'PAHAL (DBTL)',
      bankName: 'State Bank of India',
      maskedBankAcc: 'XXXX-XXXX-6721',
      ifscCode: 'SBIN0001829',
      aadhaarLinked: true,
      maskedAadhaar: 'XXXX-XXXX-7123',
      securityDeposit: 1450.00,
      connectionDate: '2023-01-10',
      lastBookingDate: new Date(Date.now() - 25 * 86400000).toISOString(),
      lastDeliveryDate: new Date(Date.now() - 23 * 86400000).toISOString(),
      currentBookingStatus: 'delivered',
    };

    this.mockRegistry[key] = newRecord;
    return newRecord;
  }

  async verifyConsumer({ providerId, consumerNumber, mobileNumber }) {
    if (!consumerNumber || !providerId) {
      return { success: false, error: 'Provider and Consumer Number are required.' };
    }

    const cleanConsumer = consumerNumber.trim().toUpperCase();
    const cleanMobile = mobileNumber ? mobileNumber.trim() : '';
    const record = this.getOrCreateConsumer(providerId, cleanConsumer, cleanMobile);

    // If a mobile number is provided, verify match (for simulated test, allow last 4 digits match or same)
    if (cleanMobile && record.registeredMobile) {
      const match = record.registeredMobile === cleanMobile || record.registeredMobile.slice(-4) === cleanMobile.slice(-4);
      if (!match) {
        return {
          success: false,
          error: 'Mobile number does not match registered consumer profile in LPG grid.',
          is_simulated: true,
        };
      }
    }

    return {
      success: true,
      is_simulated: true,
      dataSource: this.dataSourceNotice,
      verified: true,
      consumer: {
        providerId: record.providerId,
        providerName: record.providerName,
        consumerNumber: record.consumerNumber,
        maskedConsumerNumber: record.maskedConsumerNumber,
        consumerName: record.consumerName,
        registeredMobile: record.registeredMobile,
        maskedMobile: record.maskedMobile,
        connectionStatus: record.connectionStatus,
        distributorName: record.distributorName,
        deliveryAddress: record.deliveryAddress,
        subsidyEligible: record.subsidyEligible,
      },
    };
  }

  async fetchConnectionDetails({ providerId, consumerNumber }) {
    const record = this.getOrCreateConsumer(providerId, consumerNumber);
    return {
      success: true,
      is_simulated: true,
      dataSource: this.dataSourceNotice,
      connection: {
        ...record,
        // Privacy protection: Ensure raw Aadhaar is NEVER returned
        maskedAadhaar: record.maskedAadhaar || 'XXXX-XXXX-9999',
        aadhaarNumber: undefined,
      },
    };
  }

  async bookRefill({ providerId, consumerNumber, cylinderType = '14.2kg', paymentMode = 'cod', deliveryAddress }) {
    const record = this.getOrCreateConsumer(providerId, consumerNumber);
    const pCode = providerId === 'indane' ? 'IND' : providerId === 'bharat_gas' ? 'BHT' : 'HP';
    const bookingRef = `BK-${pCode}-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));

    const prices = {
      '14.2kg': 803.00,
      '5kg': 310.00,
      '19kg': 1740.00,
    };
    const amountPayable = prices[cylinderType] || 803.00;

    const deliveryDate = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];

    return {
      success: true,
      is_simulated: true,
      dataSource: this.dataSourceNotice,
      booking: {
        bookingReference: bookingRef,
        consumerNumber: record.consumerNumber,
        providerId,
        providerName: record.providerName,
        cylinderType,
        amountPayable,
        paymentMode,
        bookingDate: new Date().toISOString(),
        estimatedDeliveryDate: deliveryDate,
        bookingStatus: 'booking_confirmed',
        deliveryPersonName: 'Murugan Swamy',
        deliveryPersonPhone: '9840192837',
        deliveryOtp,
        distributorName: record.distributorName,
        deliveryAddress: deliveryAddress || record.deliveryAddress,
      },
    };
  }

  async trackBooking({ providerId, bookingReference }) {
    // Return multi-stage milestone tracking data
    const pCode = providerId === 'indane' ? 'Indane Gas' : providerId === 'bharat_gas' ? 'Bharat Gas' : 'HP Gas';
    return {
      success: true,
      is_simulated: true,
      dataSource: this.dataSourceNotice,
      tracking: {
        bookingReference,
        providerName: pCode,
        currentStage: 'out_for_delivery',
        stages: [
          { key: 'booking_pending', label: 'Booking Request Received', labelTa: 'முன்பதிவு பெறப்பட்டது', time: '2026-11-19 10:30 AM', completed: true },
          { key: 'booking_confirmed', label: 'Distributor Confirmed & Invoiced', labelTa: 'விநியோகஸ்தர் உறுதி செய்தார்', time: '2026-11-19 02:15 PM', completed: true },
          { key: 'cylinder_allocated', label: 'Cylinder Quality & Weight Checked', labelTa: 'எடை & தரம் சோதிக்கப்பட்டது', time: '2026-11-20 08:30 AM', completed: true },
          { key: 'out_for_delivery', label: 'Out For Delivery (Vehicle TN-02-AK-9812)', labelTa: 'டெலிவரிக்கு புறப்பட்டது', time: '2026-11-21 09:00 AM', completed: true, active: true },
          { key: 'delivered', label: 'Delivered & Payment Verified', labelTa: 'டெலிவரி செய்யப்பட்டது', time: 'Expected by Today, 04:00 PM', completed: false },
        ],
        deliveryAgent: {
          name: 'Murugan Swamy',
          phone: '9840192837',
          vehicle: 'TVS King Commercial (TN-02-AK-9812)',
          agency: 'Sri Meenakshi Indane Vitrak',
        },
        deliveryOtp: '8492',
        cylinderWeightKg: 14.2,
        tareWeightKg: 15.6,
        grossWeightKg: 29.8,
        safetyCheckCompleted: true,
      },
    };
  }

  async fetchRefillHistory({ providerId, consumerNumber }) {
    return {
      success: true,
      is_simulated: true,
      dataSource: this.dataSourceNotice,
      history: [
        {
          bookingReference: 'BK-IND-2026-64192',
          bookingDate: '2026-10-18',
          deliveryDate: '2026-10-20',
          cylinderType: '14.2kg',
          amount: 803.00,
          paymentMode: 'Online UPI',
          status: 'delivered',
          deliveryPerson: 'Murugan Swamy',
          subsidyStatus: 'credited',
          subsidyAmount: 200.00,
          utrNumber: 'UTR-SBI-2026-991829',
        },
        {
          bookingReference: 'BK-IND-2026-41902',
          bookingDate: '2026-09-14',
          deliveryDate: '2026-09-16',
          cylinderType: '14.2kg',
          amount: 803.00,
          paymentMode: 'Online UPI',
          status: 'delivered',
          deliveryPerson: 'R. Suresh',
          subsidyStatus: 'credited',
          subsidyAmount: 200.00,
          utrNumber: 'UTR-SBI-2026-118274',
        },
        {
          bookingReference: 'BK-IND-2026-18920',
          bookingDate: '2026-08-11',
          deliveryDate: '2026-08-13',
          cylinderType: '14.2kg',
          amount: 803.00,
          paymentMode: 'Cash on Delivery',
          status: 'delivered',
          deliveryPerson: 'R. Suresh',
          subsidyStatus: 'credited',
          subsidyAmount: 200.00,
          utrNumber: 'UTR-SBI-2026-004921',
        },
      ],
    };
  }

  async fetchSubsidyDetails({ providerId, consumerNumber }) {
    return {
      success: true,
      is_simulated: true,
      dataSource: this.dataSourceNotice,
      subsidy: {
        isEligible: true,
        scheme: 'Direct Benefit Transfer for LPG (DBTL - PAHAL)',
        currentSubsidyPerCylinder: 200.00,
        linkedBankName: 'State Bank of India',
        maskedAccountNumber: 'XXXX-XXXX-4819',
        ifscCode: 'SBIN0004128',
        aadhaarSeedingStatus: 'Active & Verified (NPCI Mapper)',
        totalSubsidyReceivedThisFinancialYear: 1200.00,
        lastDisbursement: {
          amount: 200.00,
          date: '2026-10-21',
          utrNo: 'UTR-SBI-2026-991829',
          status: 'Credited to Bank Account',
        },
      },
    };
  }
}

module.exports = MockLpgProviderAdapter;
