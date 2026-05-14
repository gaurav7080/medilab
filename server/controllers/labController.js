const supabase = require('../config/db');

exports.getLabs = async (req, res) => {
    try {
        const { data: labs, error } = await supabase.from('labs').select('*').eq('status', 'Verified').order('name');
        if (error) throw error;
        res.json({ success: true, labs });
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
};

exports.getAllLabs = async (req, res) => {
    try {
        const { data: labs, error } = await supabase.from('labs').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json({ success: true, labs });
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
};

exports.getLab = async (req, res) => {
    try {
        const { data: lab, error } = await supabase.from('labs').select('*').eq('id', req.params.id).single();
        if (error || !lab) return res.status(404).json({ error: 'Lab not found' });
        res.json({ success: true, lab });
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
};
