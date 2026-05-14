const supabase = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        if (req.user.role === 'Patient') {
            const { data: bookings } = await supabase.from('bookings').select('status').eq('user_id', req.user.id);
            const b = bookings || [];
            const bookingIds = b.map(x => x.id).filter(Boolean);
            res.json({ success: true, stats: {
                totalBookings: b.length,
                pendingBookings: b.filter(x => x.status === 'Pending').length,
                approvedBookings: b.filter(x => x.status === 'Approved').length,
                completedBookings: b.filter(x => x.status === 'Completed').length,
                totalReports: 0
            }});
        } else if (req.user.role === 'Admin') {
            const labId = req.user.lab_id;
            const { data: bookings } = await supabase.from('bookings').select('status').eq('lab_id', labId);
            const { count: reportsCount } = await supabase.from('reports').select('id', { count: 'exact', head: true }).eq('lab_id', labId);
            const { count: testsCount } = await supabase.from('tests').select('id', { count: 'exact', head: true }).eq('lab_id', labId);
            const { data: lab } = await supabase.from('labs').select('name').eq('id', labId).single();
            const b = bookings || [];
            res.json({ success: true, stats: {
                labName: lab?.name || 'Lab Admin',
                totalBookings: b.length,
                pendingBookings: b.filter(x => x.status === 'Pending').length,
                approvedBookings: b.filter(x => x.status === 'Approved').length,
                completedBookings: b.filter(x => x.status === 'Completed').length,
                totalReports: reportsCount || 0,
                totalTests: testsCount || 0
            }});
        }
    } catch (error) { console.error(error); res.status(500).json({ error: 'Server error' }); }
};
