const jwt = require('jsonwebtoken');
const supabase = require('../config/db');

// Helper to check user subscription if token is present
const getUserSubscription = async (req) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return 'Basic';

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { data: user } = await supabase.from('users').select('subscription, subscription_end_date').eq('id', decoded.id).single();
        if (!user) return 'Basic';

        // Check if expired
        if (user.subscription_end_date && new Date(user.subscription_end_date) < new Date()) {
            return 'Basic';
        }
        return user.subscription || 'Basic';
    } catch (error) {
        return 'Basic';
    }
};

exports.getTests = async (req, res) => {
    try {
        let query = supabase.from('tests').select('*, labs(id, name, location)');
        if (req.query.labId) query = query.eq('lab_id', req.query.labId);
        if (req.query.search) query = query.ilike('test_name', `%${req.query.search}%`);
        
        const { data: tests, error } = await query.order('test_name');
        if (error) throw error;

        // Check current requester's subscription status
        const userSub = await getUserSubscription(req);

        // Apply discount: Plus = 10% discount, Pro = 15% discount
        let discountPercent = 0;
        if (userSub === 'Plus') discountPercent = 10;
        else if (userSub === 'Pro') discountPercent = 15;

        const enrichedTests = tests.map(test => {
            const originalPrice = parseFloat(test.price);
            let discountedPrice = originalPrice;
            if (discountPercent > 0) {
                discountedPrice = Math.max(0, originalPrice * (1 - discountPercent / 100));
            }
            return {
                ...test,
                discount_percent: discountPercent,
                discounted_price: Math.round(discountedPrice * 100) / 100, // round to 2 decimals
                has_discount: discountPercent > 0
            };
        });

        res.json({ success: true, tests: enrichedTests });
    } catch (error) { 
        console.error('getTests error:', error);
        res.status(500).json({ error: 'Server error' }); 
    }
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
