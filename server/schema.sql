-- MediLab Database Schema for Supabase (PostgreSQL)
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor

-- ─── Labs Table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS labs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    phone VARCHAR(15) DEFAULT '',
    gst_number VARCHAR(20) DEFAULT '',
    lab_id VARCHAR(50) DEFAULT '',
    profile TEXT DEFAULT '',
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Verified', 'Rejected')),
    registered_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Users Table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(10) DEFAULT 'Patient' CHECK (role IN ('Patient', 'Admin')),
    lab_id UUID REFERENCES labs(id) ON DELETE SET NULL,
    phone VARCHAR(15) DEFAULT '',
    status VARCHAR(10) DEFAULT 'Active' CHECK (status IN ('Active', 'Pending')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Tests Table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lab_id UUID NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
    test_name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Haematology', 'Biochemistry', 'Immunology', 'Virology', 'Microbiology', 'Endocrinology', 'Cardiology', 'Other')),
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    turnaround_time VARCHAR(20) NOT NULL CHECK (turnaround_time IN ('24 hours', '48 hours', '72 hours', '1 week')),
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Bookings Table ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lab_id UUID NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
    test_name VARCHAR(200) NOT NULL,
    patient_name VARCHAR(100) NOT NULL,
    patient_email VARCHAR(255) NOT NULL,
    booking_date TIMESTAMPTZ DEFAULT NOW(),
    test_date VARCHAR(20) DEFAULT '',
    test_time VARCHAR(20) DEFAULT '',
    notes TEXT DEFAULT '',
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Completed', 'Cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Reports Table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lab_id UUID NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
    results TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    file_path VARCHAR(500) DEFAULT '',
    original_file_name VARCHAR(255) DEFAULT '',
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_tests_lab_id ON tests(lab_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_lab_id ON bookings(lab_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_reports_booking_id ON reports(booking_id);
CREATE INDEX IF NOT EXISTS idx_reports_lab_id ON reports(lab_id);

-- ─── Enable RLS (Row Level Security) ────────────────────
-- We handle auth via JWT in our Express server, so we allow
-- the service role key full access. For direct client access,
-- you'd add RLS policies here.
ALTER TABLE labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (our Express backend uses this)
CREATE POLICY "Service role full access" ON labs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON tests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON reports FOR ALL USING (true) WITH CHECK (true);
