/**
 * MediLab Database Seed Script (Supabase/PostgreSQL)
 * Run: node seed.js
 * Prerequisite: Run schema.sql in Supabase SQL Editor first!
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('./config/db');

const seed = async () => {
    try {
        console.log('🌱 Starting Supabase database seed...\n');

        // Clear existing data (order matters for FK constraints)
        await supabase.from('reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('tests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('labs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        console.log('🗑️  Cleared existing data');

        // ─── Create Labs ──────────────────────────────────
        const { data: labs, error: labErr } = await supabase.from('labs').insert([
            { name: 'PathLab Delhi', location: 'New Delhi', phone: '9111234567', gst_number: '27AABAA0000R0Z0', lab_id: 'LAB-001', profile: 'Premium pathology lab with advanced testing facilities', status: 'Verified' },
            { name: 'PathLab Mumbai', location: 'Mumbai', phone: '9221234567', gst_number: '27AABAA0000R0Z1', lab_id: 'LAB-002', profile: 'Certified diagnostic center with home sample collection', status: 'Verified' },
            { name: 'PathLab Bangalore', location: 'Bangalore', phone: '9801234567', gst_number: '27AABAA0000R0Z2', lab_id: 'LAB-003', profile: 'High-tech lab with experienced pathologists', status: 'Verified' },
            { name: 'PathLab Hyderabad', location: 'Hyderabad', phone: '9401234567', gst_number: '27AABAA0000R0Z3', lab_id: 'LAB-004', profile: 'Full-service diagnostic lab for all test types', status: 'Verified' },
            { name: 'PathLab Kolkata', location: 'Kolkata', phone: '9331234567', gst_number: '27AABAA0000R0Z4', lab_id: 'LAB-005', profile: 'ISO certified and NABL accredited laboratory', status: 'Verified' },
            { name: 'PathLab Chennai', location: 'Chennai', phone: '9441234567', gst_number: '27AABAA0000R0Z5', lab_id: 'LAB-006', profile: 'Modern lab with online report delivery system', status: 'Verified' }
        ]).select();
        if (labErr) throw labErr;
        console.log(`✅ Created ${labs.length} labs`);

        // ─── Create Users ─────────────────────────────────
        const salt = await bcrypt.genSalt(12);
        const adminPass = await bcrypt.hash('Admin@123', salt);
        const patientPass = await bcrypt.hash('Patient@123', salt);

        const { data: users, error: userErr } = await supabase.from('users').insert([
            { name: 'Admin Alpha', email: 'admin-alpha@medilab.com', password: adminPass, role: 'Admin', lab_id: labs[0].id, phone: '9876543210', status: 'Active' },
            { name: 'Admin Beta', email: 'admin-beta@medilab.com', password: adminPass, role: 'Admin', lab_id: labs[1].id, phone: '9876543211', status: 'Active' },
            { name: 'Rajesh Kumar', email: 'rajesh.kumar@email.com', password: patientPass, role: 'Patient', phone: '9876543212' },
            { name: 'Priya Singh', email: 'priya.singh@email.com', password: patientPass, role: 'Patient', phone: '9876543213' },
            { name: 'Amit Patel', email: 'amit.patel@email.com', password: patientPass, role: 'Patient', phone: '9876543214' },
            { name: 'Neha Gupta', email: 'neha.gupta@email.com', password: patientPass, role: 'Patient', phone: '9876543215' },
            { name: 'Rohan Verma', email: 'rohan.verma@email.com', password: patientPass, role: 'Patient', phone: '9876543216' }
        ]).select();
        if (userErr) throw userErr;
        console.log(`✅ Created ${users.length} users`);

        // ─── Create Tests ─────────────────────────────────
        const { data: tests, error: testErr } = await supabase.from('tests').insert([
            { lab_id: labs[0].id, test_name: 'Blood Test - Complete Blood Count', category: 'Haematology', price: 499, turnaround_time: '24 hours', description: 'Complete Blood Count (CBC) includes hemoglobin, RBC, WBC, platelets' },
            { lab_id: labs[0].id, test_name: 'Blood Test - Lipid Profile', category: 'Biochemistry', price: 599, turnaround_time: '24 hours', description: 'Tests for cholesterol, triglycerides, HDL, LDL' },
            { lab_id: labs[0].id, test_name: 'COVID-19 RT-PCR', category: 'Virology', price: 799, turnaround_time: '48 hours', description: 'RT-PCR test for COVID-19 detection' },
            { lab_id: labs[0].id, test_name: 'Thyroid Profile (TSH, T3, T4)', category: 'Endocrinology', price: 699, turnaround_time: '24 hours', description: 'Complete thyroid function tests' },
            { lab_id: labs[1].id, test_name: 'Blood Test - Complete Blood Count', category: 'Haematology', price: 449, turnaround_time: '24 hours', description: 'Complete Blood Count (CBC)' },
            { lab_id: labs[1].id, test_name: 'Liver Function Test', category: 'Biochemistry', price: 549, turnaround_time: '24 hours', description: 'Tests for bilirubin, AST, ALT, ALP, albumin, protein' },
            { lab_id: labs[2].id, test_name: 'Kidney Function Test', category: 'Biochemistry', price: 499, turnaround_time: '24 hours', description: 'Tests for creatinine, urea, BUN, electrolytes' },
            { lab_id: labs[2].id, test_name: 'Vitamin B12 & Folate', category: 'Biochemistry', price: 899, turnaround_time: '48 hours', description: 'Deficiency screening for Vitamin B12 and Folate' }
        ]).select();
        if (testErr) throw testErr;
        console.log(`✅ Created ${tests.length} tests`);

        console.log('\n' + '═'.repeat(50));
        console.log('🔑 LOGIN CREDENTIALS');
        console.log('═'.repeat(50));
        console.log('\n📋 Admin: admin-alpha@medilab.com / Admin@123 (PathLab Delhi)');
        console.log('📋 Admin: admin-beta@medilab.com / Admin@123 (PathLab Mumbai)');
        console.log('📋 Patient: rajesh.kumar@email.com / Patient@123');
        console.log('📋 Patient: priya.singh@email.com / Patient@123');
        console.log('\n✅ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seed();
