const jwt = require('jsonwebtoken');
const supabase = require('../config/db');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ error: 'Not authorized - no token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { data: user } = await supabase.from('users').select('*, labs(*)').eq('id', decoded.id).single();
        if (!user) return res.status(401).json({ error: 'Not authorized - user not found' });
        delete user.password;
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Not authorized - invalid token' });
    }
};

const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') return next();
    return res.status(403).json({ error: 'Access denied - Admin only' });
};

const requirePatient = (req, res, next) => {
    if (req.user && req.user.role === 'Patient') return next();
    return res.status(403).json({ error: 'Access denied - Patient only' });
};

module.exports = { protect, requireAdmin, requirePatient };
