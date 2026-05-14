const supabase = require('../config/db');

// @desc    Get all family members for current user
// @route   GET /api/family
// @access  Private (Patient)
exports.getFamilyMembers = async (req, res) => {
    try {
        const { data: family, error } = await supabase
            .from('family_members')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            count: family.length,
            family
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error retrieving family members' });
    }
};

// @desc    Add a family member
// @route   POST /api/family
// @access  Private (Patient)
exports.addFamilyMember = async (req, res) => {
    try {
        const { name, relation, age, gender, blood_group } = req.body;

        if (!name || !relation || !age || !gender) {
            return res.status(400).json({ error: 'Please provide name, relation, age, and gender' });
        }

        const { data: member, error } = await supabase
            .from('family_members')
            .insert([{
                user_id: req.user.id,
                name,
                relation,
                age,
                gender,
                blood_group
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            success: true,
            member
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error adding family member' });
    }
};

// @desc    Delete a family member
// @route   DELETE /api/family/:id
// @access  Private (Patient)
exports.deleteFamilyMember = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if member belongs to user
        const { data: existing, error: checkError } = await supabase
            .from('family_members')
            .select('*')
            .eq('id', id)
            .eq('user_id', req.user.id)
            .single();

        if (checkError || !existing) {
            return res.status(404).json({ error: 'Family member not found' });
        }

        const { error: deleteError } = await supabase
            .from('family_members')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        res.json({ success: true, data: {} });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error deleting family member' });
    }
};
