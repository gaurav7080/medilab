const supabase = require('../config/db');

exports.getBookings = async (req, res) => {
    try {
        let query = supabase.from('bookings').select('*, labs(name, location), users(name, email)');
        if (req.user.role === 'Patient') query = query.eq('user_id', req.user.id);
        else if (req.user.role === 'Admin') query = query.eq('lab_id', req.user.lab_id);
        if (req.query.status) query = query.eq('status', req.query.status);
        const { data: bookings, error } = await query.order('booking_date', { ascending: false });
        if (error) throw error;
        // Map for frontend compatibility
        const mapped = bookings.map(b => ({ ...b, labId: b.labs, userId: b.users, patientName: b.patient_name, patientEmail: b.patient_email, bookingDate: b.booking_date, testName: b.test_name }));
        res.json({ success: true, bookings: mapped });
    } catch (error) { console.error(error); res.status(500).json({ error: 'Server error' }); }
};

exports.createBooking = async (req, res) => {
    try {
        const { labId, testName, testDate, testTime, notes } = req.body;
        if (!testName || testName.length < 3) return res.status(400).json({ error: 'Test name must be at least 3 chars' });
        if (!labId) return res.status(400).json({ error: 'Please select a lab' });

        const { data: lab } = await supabase.from('labs').select('id').eq('id', labId).single();
        if (!lab) return res.status(404).json({ error: 'Lab not found' });

        const { data: booking, error } = await supabase.from('bookings').insert({
            user_id: req.user.id, lab_id: labId, test_name: testName,
            patient_name: req.user.name, patient_email: req.user.email,
            test_date: testDate || '', test_time: testTime || '', notes: notes || '', status: 'Pending'
        }).select('*, labs(name, location)').single();
        if (error) throw error;
        const mapped = { ...booking, labId: booking.labs, testName: booking.test_name, patientName: booking.patient_name, bookingDate: booking.booking_date };
        res.status(201).json({ success: true, booking: mapped });
    } catch (error) { console.error(error); res.status(500).json({ error: 'Server error' }); }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Pending', 'Approved', 'Completed', 'Cancelled'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
        const { data: booking, error } = await supabase.from('bookings').update({ status, updated_at: new Date().toISOString() })
            .eq('id', req.params.id).eq('lab_id', req.user.lab_id).select().single();
        if (error || !booking) return res.status(404).json({ error: 'Booking not found or unauthorized' });
        res.json({ success: true, booking });
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
};

exports.getBooking = async (req, res) => {
    try {
        const { data: booking, error } = await supabase.from('bookings').select('*, labs(name, location), users(name, email)').eq('id', req.params.id).single();
        if (error || !booking) return res.status(404).json({ error: 'Booking not found' });
        const isOwner = booking.user_id === req.user.id;
        const isLabAdmin = req.user.role === 'Admin' && booking.lab_id === req.user.lab_id;
        if (!isOwner && !isLabAdmin) return res.status(403).json({ error: 'Not authorized' });
        res.json({ success: true, booking });
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
};
