const supabase = require('../config/db');

exports.getTests = async (req, res) => {
    try {
        let query = supabase.from('tests').select('*, labs(name, location)');
        if (req.query.labId) query = query.eq('lab_id', req.query.labId);
        const { data: tests, error } = await query.order('test_name');
        if (error) throw error;
        res.json({ success: true, tests });
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
};

exports.getMyLabTests = async (req, res) => {
    try {
        const labId = req.user.lab_id;
        if (!labId) return res.status(400).json({ error: 'No lab associated' });
        const { data: tests, error } = await supabase.from('tests').select('*').eq('lab_id', labId).order('test_name');
        if (error) throw error;
        res.json({ success: true, tests });
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
};

exports.createTest = async (req, res) => {
    try {
        const labId = req.user.lab_id;
        if (!labId) return res.status(400).json({ error: 'No lab associated' });
        const { testName, category, price, turnaroundTime, description } = req.body;
        const { data: test, error } = await supabase.from('tests').insert({
            lab_id: labId, test_name: testName, category, price, turnaround_time: turnaroundTime, description: description || ''
        }).select().single();
        if (error) throw error;
        res.status(201).json({ success: true, test });
    } catch (error) { console.error(error); res.status(500).json({ error: 'Server error' }); }
};

exports.updateTest = async (req, res) => {
    try {
        const labId = req.user.lab_id;
        const { testName, category, price, turnaroundTime, description } = req.body;
        const updates = {};
        if (testName) updates.test_name = testName;
        if (category) updates.category = category;
        if (price !== undefined) updates.price = price;
        if (turnaroundTime) updates.turnaround_time = turnaroundTime;
        if (description !== undefined) updates.description = description;
        updates.updated_at = new Date().toISOString();

        const { data: test, error } = await supabase.from('tests').update(updates).eq('id', req.params.id).eq('lab_id', labId).select().single();
        if (error || !test) return res.status(404).json({ error: 'Test not found or unauthorized' });
        res.json({ success: true, test });
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
};

exports.deleteTest = async (req, res) => {
    try {
        const labId = req.user.lab_id;
        const { error } = await supabase.from('tests').delete().eq('id', req.params.id).eq('lab_id', labId);
        if (error) throw error;
        res.json({ success: true, message: 'Test deleted' });
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
};
