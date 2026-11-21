const db = require('../config/db');
const lpgAdapter = require('../services/lpg');
const brevoService = require('../services/brevoService');
const fcmService = require('../services/fcmService');

/**
 * Create a new LPG Refill Booking
 */
async function createBooking(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const { connectionId, cylinderType = '14.2kg', paymentMode = 'cod', deliveryAddress, language = 'en' } = req.body;

    if (!connectionId) {
      return res.status(400).json({
        success: false,
        error: 'Please select a valid LPG connection.',
        errorTa: 'எரிவாயு இணைப்பைத் தேர்ந்தெடுக்கவும்.',
      });
    }

    const conn = await db.connections.findById(connectionId);
    if (!conn) {
      return res.status(404).json({
        success: false,
        error: 'Connection not found or permission not granted.',
        errorTa: 'இணைப்பு விவரங்கள் கிடைக்கவில்லை.',
      });
    }

    // Compute price
    let amountPayable = conn.cylinder_price_14kg || 803.00;
    if (cylinderType === '5kg') amountPayable = conn.cylinder_price_5kg || 310.00;
    if (cylinderType === '19kg') amountPayable = conn.cylinder_price_19kg || 1740.00;

    const pCode = conn.provider_id === 'indane' ? 'IND' : conn.provider_id === 'bharat_gas' ? 'BHT' : 'HP';
    const bookingRef = `BK-${pCode}-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));
    const estimatedDelivery = new Date(Date.now() + 2 * 86400000);

    // Create Booking Document in MongoDB
    const booking = await db.bookings.create({
      booking_reference: bookingRef,
      connection_id: conn._id || conn.id,
      user_id: userId,
      provider_id: conn.provider_id,
      cylinder_type: cylinderType,
      estimated_delivery_date: estimatedDelivery,
      amount_payable: amountPayable,
      payment_mode: paymentMode,
      delivery_person_name: 'Murugan Swamy',
      delivery_person_phone: '9840192837',
      delivery_otp: deliveryOtp,
      booking_status: 'booking_confirmed',
    });

    await brevoService.sendEmail({
      to: req.user.email,
      subject: `LPG refill booking confirmed: ${bookingRef}`,
      textContent: `Your ${conn.provider_name} refill booking is confirmed. Amount: Rs.${amountPayable}. Expected delivery: ${estimatedDelivery.toLocaleDateString('en-IN')}.`,
      htmlContent: `<p>Your <b>${conn.provider_name}</b> refill booking is confirmed.</p><p>Booking reference: <b>${bookingRef}</b></p><p>Amount: Rs.${amountPayable}</p><p>Expected delivery: ${estimatedDelivery.toLocaleDateString('en-IN')}</p>`,
    });

    // Send push notification via FCM
    if (req.user.fcm_token) {
      await fcmService.sendPushNotification({
        token: req.user.fcm_token,
        title: `LPG Refill Confirmed (${bookingRef})`,
        body: `Your ${conn.provider_name} refill order is placed! Delivery expected by ${estimatedDelivery.toLocaleDateString()}.`,
      });
    }

    // Add In-App Notification
    await db.notifications.create({
      user_id: userId,
      title: `Refill Booked: ${bookingRef}`,
      title_ta: `சிலிண்டர் முன்பதிவு: ${bookingRef}`,
      message: `Your refill booking for ${conn.consumer_name} (${conn.provider_name}) has been confirmed. Payable: ₹${amountPayable}.`,
      message_ta: `உங்கள் சிலிண்டர் முன்பதிவு (${conn.provider_name}) வெற்றிகரமாக பதிவானது. செலுத்த வேண்டிய தொகை: ₹${amountPayable}.`,
      notification_type: 'booking_status',
      channel: 'all',
      reference_id: bookingRef,
    });

    return res.status(201).json({
      success: true,
      message: 'LPG refill booked successfully. Confirmation email sent.',
      messageTa: 'சிலிண்டர் முன்பதிவு வெற்றிகரமாக முடிந்தது! மின்னஞ்சல் அனுப்பப்பட்டது.',
      booking: {
        id: booking._id || booking.id,
        bookingReference: bookingRef,
        connectionId: conn._id || conn.id,
        providerName: conn.provider_name,
        cylinderType,
        amountPayable,
        paymentMode,
        bookingDate: new Date(),
        estimatedDeliveryDate: estimatedDelivery,
        bookingStatus: 'booking_confirmed',
        deliveryPersonName: 'Murugan Swamy',
        deliveryPersonPhone: '9840192837',
        deliveryOtp,
      },
    });
  } catch (err) {
    console.error('Error booking refill:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Track an LPG Booking in Real-Time
 */
async function trackBooking(req, res) {
  try {
    const { reference } = req.params;
    const b = await db.bookings.findOne({ booking_reference: reference });

    if (!b) {
      return res.status(404).json({
        success: false,
        error: 'Booking reference not found in National LPG Grid.',
        errorTa: 'முன்பதிவு எண் கிடைக்கவில்லை.',
      });
    }

    const cNo = b.consumer_number || 'IND-7009412';
    const masked = cNo.length > 4 ? cNo.slice(0, 3) + '-***-' + cNo.slice(-4) : '***' + cNo;

    const stages = [
      {
        key: 'booking_pending',
        label: 'Booking Initiated',
        labelTa: 'முன்பதிவு துவங்கியது',
        time: new Date(b.booking_date || b.createdAt).toLocaleString('en-IN'),
        completed: true,
      },
      {
        key: 'booking_confirmed',
        label: 'Agency Invoiced & Cylinder Allocated',
        labelTa: 'முகவர் உறுதி செய்து சிலிண்டர் ஒதுக்கீடு',
        time: new Date(new Date(b.booking_date || b.createdAt).getTime() + 4 * 3600000).toLocaleString('en-IN'),
        completed: ['booking_confirmed', 'out_for_delivery', 'delivered'].includes(b.booking_status),
      },
      {
        key: 'out_for_delivery',
        label: 'Out for Delivery (Truck Dispatched)',
        labelTa: 'டெலிவரிக்கு புறப்பட்டது',
        time: b.booking_status === 'out_for_delivery' || b.booking_status === 'delivered' ? 'Today, 09:15 AM' : 'Expected within 24 hrs',
        completed: ['out_for_delivery', 'delivered'].includes(b.booking_status),
        active: b.booking_status === 'out_for_delivery',
      },
      {
        key: 'delivered',
        label: 'Delivered & Subsidy Triggered',
        labelTa: 'டெலிவரி செய்யப்பட்டது & மானியம் தொடக்கம்',
        time: b.actual_delivery_date ? new Date(b.actual_delivery_date).toLocaleString('en-IN') : 'Expected by 05:00 PM',
        completed: b.booking_status === 'delivered',
      },
    ];

    if (b.booking_status === 'cancelled') {
      stages.push({
        key: 'cancelled',
        label: `Booking Cancelled: ${b.cancellation_reason || 'By Citizen Request'}`,
        labelTa: 'முன்பதிவு ரத்து செய்யப்பட்டது',
        time: new Date(b.updatedAt || Date.now()).toLocaleString('en-IN'),
        completed: true,
        error: true,
      });
    }

    return res.json({
      success: true,
      booking: {
        ...b,
        id: b._id || b.id,
        masked_consumer_number: masked,
      },
      stages,
      is_simulated: true,
      dataSource: 'National LPG Grid Tracking Gateway',
    });
  } catch (err) {
    console.error('Error tracking booking:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Cancel an Active Booking
 */
async function cancelBooking(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const { reference } = req.params;
    const { reason = 'Citizen requested cancellation', language = 'en' } = req.body;

    const b = await db.bookings.findOne({ booking_reference: reference });
    if (!b || String(b.user_id) !== String(userId)) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found or not authorized to cancel.',
        errorTa: 'முன்பதிவு கிடைக்கவில்லை.',
      });
    }

    if (b.booking_status === 'delivered') {
      return res.status(400).json({
        success: false,
        error: 'Delivered orders cannot be cancelled.',
        errorTa: 'டெலிவரி செய்யப்பட்ட சிலிண்டரை ரத்து செய்ய இயலாது.',
      });
    }

    await db.bookings.findOneAndUpdate(
      { booking_reference: reference },
      { booking_status: 'cancelled', cancellation_reason: reason }
    );

    await brevoService.sendEmail({
      to: req.user.email,
      subject: `LPG booking cancelled: ${reference}`,
      textContent: `Your LPG booking ${reference} has been cancelled. Reason: ${reason}.`,
      htmlContent: `<p>Your LPG booking <b>${reference}</b> has been cancelled.</p><p>Reason: ${String(reason || '').replace(/[<>&"]/g, '')}</p>`,
    });

    return res.json({
      success: true,
      message: 'Booking cancelled successfully. Email confirmation sent.',
      messageTa: 'முன்பதிவு வெற்றிகரமாக ரத்து செய்யப்பட்டது.',
    });
  } catch (err) {
    console.error('Error cancelling booking:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Get All Bookings for User
 */
async function getUserBookings(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const bookings = await db.bookings.find({ user_id: userId });

    const enriched = bookings.map((b) => {
      const cNo = b.consumer_number || 'IND-7009412';
      return {
        ...b,
        id: b._id || b.id,
        masked_consumer_number: cNo.length > 4 ? cNo.slice(0, 3) + '-***-' + cNo.slice(-4) : '***' + cNo,
      };
    });

    return res.json({
      success: true,
      bookings: enriched,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * Digital Delivery Receipt Generation
 */
async function downloadReceipt(req, res) {
  try {
    const { reference } = req.params;
    const b = await db.bookings.findOne({ booking_reference: reference });

    if (!b) {
      return res.status(404).json({ success: false, error: 'Receipt not found.' });
    }

    const cNo = b.consumer_number || 'IND-7009412';
    const amount = Number(b.amount_payable || 803.00);
    const basePrice = (amount / 1.05).toFixed(2);
    const gstGst = (amount - basePrice).toFixed(2);
    const cgst = (gstGst / 2).toFixed(2);
    const sgst = (gstGst / 2).toFixed(2);

    const receipt = {
      portalName: 'Bharat Scheme - Digital Government Gas Services',
      portalNameTa: 'பாரத் திட்டம் - சீர்மிகு எரிவாயு சேவை',
      invoiceNumber: `INV-${reference.replace('BK-', '')}`,
      bookingReference: b.booking_reference,
      date: new Date(b.booking_date || b.createdAt).toISOString().split('T')[0],
      providerName: b.provider_name,
      companyName: b.company_name || 'Government Oil Marketing Corporation',
      distributorName: b.distributor_name || 'Sri Meenakshi Indane Vitrak',
      distributorCode: b.distributor_code || 'DIST-01',
      consumerName: b.consumer_name,
      maskedConsumerNumber: cNo.length > 4 ? cNo.slice(0, 3) + '-***-' + cNo.slice(-4) : '***' + cNo,
      deliveryAddress: b.delivery_address,
      pincode: b.pincode,
      itemDescription: `Domestic LPG Cylinder (${b.cylinder_type || '14.2kg'})`,
      baseAmount: Number(basePrice),
      cgst: Number(cgst),
      sgst: Number(sgst),
      totalAmountPayable: amount,
      paymentMode: (b.payment_mode || 'COD').toUpperCase(),
      paymentStatus: (b.payment_status || 'PENDING').toUpperCase(),
      deliveryStatus: (b.booking_status || 'CONFIRMED').toUpperCase(),
      deliveryAgent: b.delivery_person_name || 'Murugan Swamy',
      subsidyDetails: {
        status: b.subsidy_status || 'pending',
        amount: b.subsidy_amount || 200.00,
        utrNumber: b.subsidy_utr_no || 'Pending OMC Clearance',
      },
      helpline: '1906 (24x7 Emergency LPG Leak Helpline)',
    };

    return res.json({
      success: true,
      receipt,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  createBooking,
  trackBooking,
  cancelBooking,
  getUserBookings,
  downloadReceipt,
};
