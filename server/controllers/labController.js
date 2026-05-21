const supabase = require('../config/db');

// Helper to determine lab subscription status based on admin user subscriptions
const getLabsWithSubscriptionStatus = async (labs) => {
    try {
        // Fetch admin users with active subscriptions
        const { data: admins, error } = await supabase
            .from('users')
            .select('lab_id, subscription, subscription_end_date')
            .eq('role', 'Admin')
            .not('lab_id', 'is', null);

        if (error) throw error;

        return labs.map(lab => {
            const admin = admins.find(a => a.lab_id === lab.id);
            let sub = 'Standard';
            let isPremium = false;

            if (admin && admin.subscription && admin.subscription_end_date) {
                const isExpired = new Date(admin.subscription_end_date) < new Date();
                if (!isExpired && (admin.subscription === 'Plus' || admin.subscription === 'Enterprise')) {
                    sub = admin.subscription;
                    isPremium = true;
                }
            }

            return {
                ...lab,
                subscription: sub,
                is_premium: isPremium
            };
        });
    } catch (err) {
        console.error('Error attaching lab subscriptions:', err);
        return labs.map(l => ({ ...l, subscription: 'Standard', is_premium: false }));
    }
};

exports.getLabs = async (req, res) => {
    try {
        const { data: labs, error } = await supabase.from('labs').select('*').eq('status', 'Verified');
        if (error) throw error;

        // Enrich labs with admin subscription details
        const enrichedLabs = await getLabsWithSubscriptionStatus(labs);

        // Sort: Recommended premium labs first, then alphabetical by name
        enrichedLabs.sort((a, b) => {
            if (a.is_premium && !b.is_premium) return -1;
            if (!a.is_premium && b.is_premium) return 1;
            return a.name.localeCompare(b.name);
        });

        res.json({ success: true, labs: enrichedLabs });
    } catch (error) { 
        res.status(500).json({ error: 'Server error' }); 
    }
};

exports.getAllLabs = async (req, res) => {
    try {
        const { data: labs, error } = await supabase.from('labs').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        const enrichedLabs = await getLabsWithSubscriptionStatus(labs);
        res.json({ success: true, labs: enrichedLabs });
    } catch (error) { 
        res.status(500).json({ error: 'Server error' }); 
    }
};

exports.getLab = async (req, res) => {
    try {
        const { data: lab, error } = await supabase.from('labs').select('*').eq('id', req.params.id).single();
        if (error || !lab) return res.status(404).json({ error: 'Lab not found' });

        const [enriched] = await getLabsWithSubscriptionStatus([lab]);
        res.json({ success: true, lab: enriched });
    } catch (error) { 
        res.status(500).json({ error: 'Server error' }); 
    }
};
