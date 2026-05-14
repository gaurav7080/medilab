const supabase = require('../config/db');
const path = require('path');
const fs = require('fs');

exports.getReports = async (req, res) => {
    try {
        let query = supabase.from('reports').select('*, bookings(test_name, patient_name, patient_email, status, labs(name)), users(name, email)');
        if (req.user.role === 'Patient') {
            const { data: bookings } = await supabase.from('bookings').select('id').eq('user_id', req.user.id);
            const ids = (bookings || []).map(b => b.id);
            if (!ids.length) return res.json({ success: true, reports: [] });
            query = query.in('booking_id', ids);
        } else if (req.user.role === 'Admin') {
            query = query.eq('lab_id', req.user.lab_id);
        }
        const { data: reports, error } = await query.order('upload_date', { ascending: false });
        if (error) throw error;
        // Map for frontend
        const mapped = (reports || []).map(r => ({
            ...r, _id: r.id, bookingId: { testName: r.bookings?.test_name, patientName: r.bookings?.patient_name, labId: { name: r.bookings?.labs?.name } },
            filePath: r.file_path
        }));
        res.json({ success: true, reports: mapped });
    } catch (error) { console.error(error); res.status(500).json({ error: 'Server error' }); }
};

exports.createReport = async (req, res) => {
    try {
        const { bookingId, results, notes } = req.body;
        if (!bookingId) return res.status(400).json({ error: 'Booking ID required' });

        const { data: booking } = await supabase.from('bookings').select('*').eq('id', bookingId).eq('lab_id', req.user.lab_id).single();
        if (!booking) return res.status(404).json({ error: 'Booking not found or not your lab' });

        const reportData = { booking_id: booking.id, user_id: booking.user_id, lab_id: req.user.lab_id, results: results || '', notes: notes || '' };
        if (req.file) { reportData.file_path = req.file.filename; reportData.original_file_name = req.file.originalname; }

        const { data: report, error } = await supabase.from('reports').insert(reportData).select().single();
        if (error) throw error;

        await supabase.from('bookings').update({ status: 'Completed' }).eq('id', bookingId);
        res.status(201).json({ success: true, report });
    } catch (error) { console.error(error); res.status(500).json({ error: 'Server error' }); }
};

exports.getReport = async (req, res) => {
    try {
        const { data: report, error } = await supabase.from('reports').select('*, bookings(test_name, patient_name, user_id, labs(name))').eq('id', req.params.id).single();
        if (error || !report) return res.status(404).json({ error: 'Report not found' });
        const mapped = { ...report, _id: report.id, bookingId: { testName: report.bookings?.test_name, patientName: report.bookings?.patient_name }, filePath: report.file_path };
        res.json({ success: true, report: mapped });
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
};

exports.downloadReport = async (req, res) => {
    try {
        const { data: report } = await supabase.from('reports').select('file_path, original_file_name').eq('id', req.params.id).single();
        if (!report || !report.file_path) return res.status(404).json({ error: 'No file found' });
        const filePath = path.join(__dirname, '..', 'uploads', report.file_path);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found on server' });
        res.download(filePath, report.original_file_name || report.file_path);
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
};
