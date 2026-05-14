const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/db');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role, labName, labLocation, labGST, labIdNumber, labPhone, labProfile } = req.body;

        // Check existing user
        const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
        if (existing) return res.status(400).json({ error: 'Email already registered' });

        let labRef = null;

        if (role === 'Admin') {
            if (!labName || !labLocation) return res.status(400).json({ error: 'Lab name and location required for Admin' });
            const { data: lab, error: labErr } = await supabase.from('labs').insert({
                name: labName, location: labLocation, phone: labPhone || '', gst_number: labGST || '',
                lab_id: labIdNumber || '', profile: labProfile || '', status: 'Pending'
            }).select().single();
            if (labErr) throw labErr;
            labRef = lab.id;
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { data: user, error: userErr } = await supabase.from('users').insert({
            name, email, password: hashedPassword, role: role || 'Patient',
            lab_id: labRef, phone: labPhone || '', status: role === 'Admin' ? 'Pending' : 'Active'
        }).select().single();
        if (userErr) throw userErr;

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
        delete user.password;
        res.status(201).json({ success: true, token, user });
    } catch (error) {
        console.error('Register error:', error);
        if (error.code === '23505') return res.status(400).json({ error: 'Email already registered' });
        res.status(500).json({ error: 'Server error during registration' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const { data: user, error } = await supabase.from('users').select('*, labs(*)').eq('email', email).single();
        if (error || !user) return res.status(401).json({ error: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
        delete user.password;
        res.json({ success: true, token, user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const { data: user } = await supabase.from('users').select('*, labs(*)').eq('id', req.user.id).single();
        if (user) delete user.password;
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
