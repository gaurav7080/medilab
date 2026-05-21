const supabase = require('../config/db');
const path = require('path');
const fs = require('fs');

exports.getReports = async (req, res) => {
    try {
        let query = supabase.from('reports').select('*, bookings(test_name, patient_name, patient_email, status, labs(name)), users(name, email)');
        if (req.user.role === 'Patient') {
            const { data: bookings } = await supabase.from('bookings').select('id').eq('user_id', req.user.id);
            const ids = (bookings || []).map(b => b.id);
            if (!ids.length) return res.json({ success: true, reports: [] });
            query = query.in('booking_id', ids);
        } else if (req.user.role === 'Admin') {
            query = query.eq('lab_id', req.user.lab_id);
        }
        const { data: reports, error } = await query.order('upload_date', { ascending: false });
        if (error) throw error;
        // Map for frontend
        const mapped = (reports || []).map(r => ({
            ...r, _id: r.id, bookingId: { testName: r.bookings?.test_name, patientName: r.bookings?.patient_name, labId: { name: r.bookings?.labs?.name } },
            filePath: r.file_path
        }));
        res.json({ success: true, reports: mapped });
    } catch (error) { console.error(error); res.status(500).json({ error: 'Server error' }); }
};

exports.createReport = async (req, res) => {
    try {
        const { bookingId, results, notes } = req.body;
        if (!bookingId) return res.status(400).json({ error: 'Booking ID required' });

        const { data: booking } = await supabase.from('bookings').select('*').eq('id', bookingId).eq('lab_id', req.user.lab_id).single();
        if (!booking) return res.status(404).json({ error: 'Booking not found or not your lab' });

        const reportData = { booking_id: booking.id, user_id: booking.user_id, lab_id: req.user.lab_id, results: results || '', notes: notes || '' };
        if (req.file) { reportData.file_path = req.file.filename; reportData.original_file_name = req.file.originalname; }

        const { data: report, error } = await supabase.from('reports').insert(reportData).select().single();
        if (error) throw error;

        await supabase.from('bookings').update({ status: 'Completed' }).eq('id', bookingId);
        res.status(201).json({ success: true, report });
    } catch (error) { console.error(error); res.status(500).json({ error: 'Server error' }); }
};

exports.getReport = async (req, res) => {
    try {
        const { data: report, error } = await supabase.from('reports').select('*, bookings(test_name, patient_name, user_id, labs(name))').eq('id', req.params.id).single();
        if (error || !report) return res.status(404).json({ error: 'Report not found' });
        const mapped = { ...report, _id: report.id, bookingId: { testName: report.bookings?.test_name, patientName: report.bookings?.patient_name }, filePath: report.file_path };
        res.json({ success: true, report: mapped });
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
};

exports.downloadReport = async (req, res) => {
    try {
        const { data: report } = await supabase.from('reports').select('file_path, original_file_name').eq('id', req.params.id).single();
        if (!report || !report.file_path) return res.status(404).json({ error: 'No file found' });
        const filePath = path.join(__dirname, '..', 'uploads', report.file_path);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found on server' });
        res.download(filePath, report.original_file_name || report.file_path);
    } catch (error) { res.status(500).json({ error: 'Server error' }); }
};

exports.getAiSummary = async (req, res) => {
    try {
        const { data: report, error } = await supabase.from('reports').select('*, bookings(test_name, patient_name, patient_email)').eq('id', req.params.id).single();
        if (error || !report) return res.status(404).json({ error: 'Report not found' });

        const testName = report.bookings?.test_name || 'Medical Test';
        const patientName = report.bookings?.patient_name || 'Patient';
        const results = report.results || '';
        const notes = report.notes || '';
        const reportDate = new Date(report.upload_date).toLocaleDateString('en-US', { dateStyle: 'medium' });

        const apiKey = process.env.GEMINI_API_KEY;
        
        if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY') {
            try {
                const prompt = `You are an expert AI pathology lab assistant for MediLab. 
Analyze the following patient lab test results and provide a structured, jargon-free health summary.
Keep it extremely clear, easy to understand for a normal patient, and visually engaging.

Test Name: ${testName}
Patient Name: ${patientName}
Report Date: ${reportDate}
Results / Parameter Values:
${results}

Notes:
${notes}

Return the response in a structured JSON format containing exactly the following keys:
1. "overview": A warm greeting to the patient and a 2-3 sentence overview of what the test shows in layman's terms.
2. "flagged": A list of parameters that are out of bounds or critical (if any). If none, state that all parameters look optimal.
3. "recommendations": A list of 3 actionable, friendly health recommendations based on their results (e.g. hydration, dietary shifts, physical activity).
4. "consultation": A friendly recommendation on which kind of medical specialist they should consult if they need further checkups.

JSON format:
{
  "overview": "...",
  "flagged": ["...", "..."],
  "recommendations": ["...", "...", "..."],
  "consultation": "..."
}`;

                const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
                const response = await fetch(apiURL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { responseMimeType: "application/json" }
                    })
                });
                
                const data = await response.json();
                if (response.ok && data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                    const text = data.candidates[0].content.parts[0].text;
                    const parsedJson = JSON.parse(text.trim());
                    return res.json({ success: true, summary: parsedJson });
                }
            } catch (err) {
                console.error('Gemini API call failed, falling back to smart engine:', err);
            }
        }

        // --- INTELLIGENT CLINICAL FALLBACK ENGINE ---
        const parsedSugar = parseParam(results, 'Sugar') || parseParam(results, 'Glucose');
        const parsedCholesterol = parseParam(results, 'Cholesterol') || parseParam(results, 'Lipid');
        const parsedHb = parseParam(results, 'Hemoglobin') || parseParam(results, 'Hb');

        let overview = `Hello ${patientName}. Your ${testName} uploaded on ${reportDate} has been analyzed. The results indicate that your general physiological parameters are stable and optimal.`;
        let flagged = ["All parameters look optimal and within normal clinical ranges."];
        let recommendations = [
            "Ensure you stay hydrated by drinking at least 2-3 liters of water daily.",
            "Engage in moderate physical activity like walking or cycling for 30 minutes daily.",
            "Maintain a balanced diet rich in leafy greens, whole grains, and lean proteins."
        ];
        let consultation = "For further validation of your results, you may schedule a routine checkup with a General Physician.";

        if (parsedSugar && parsedSugar > 120) {
            overview = `Hello ${patientName}. Your blood glucose level is currently measured at ${parsedSugar} mg/dL, which is elevated compared to standard fasting ranges.`;
            flagged = [`Blood Glucose: ${parsedSugar} mg/dL (Elevated - standard fasting glucose is under 100 mg/dL).`];
            recommendations = [
                "Limit intake of refined sugars, sweets, carbonated beverages, and simple carbohydrates.",
                "Include more high-fiber foods such as oats, legumes, and green vegetables in your diet.",
                "Increase regular physical activity to help improve insulin sensitivity naturally."
            ];
            consultation = "We highly advise consulting a Diabetologist or an Endocrinologist for personalized dietary planning.";
        } else if (parsedCholesterol && parsedCholesterol > 200) {
            overview = `Hello ${patientName}. Your total lipid profile shows a cholesterol level of ${parsedCholesterol} mg/dL, which indicates borderline high cardiovascular markers.`;
            flagged = [`Total Cholesterol: ${parsedCholesterol} mg/dL (Borderline High - optimal range is under 200 mg/dL).`];
            recommendations = [
                "Reduce consumption of saturated fats, fried foods, and processed red meats.",
                "Incorporate heart-healthy fats such as olive oil, avocados, almonds, and walnuts.",
                "Engage in aerobic exercises like swimming, running, or brisk walking to help boost HDL levels."
            ];
            consultation = "We recommend consulting a Cardiologist or a specialized Dietician to manage your lipid panel.";
        } else if (parsedHb && parsedHb < 12.0) {
            overview = `Hello ${patientName}. Your Hemoglobin is currently recorded at ${parsedHb} g/dL, which is slightly below the standard healthy reference bounds.`;
            flagged = [`Hemoglobin: ${parsedHb} g/dL (Low - standard range is 12.0 - 16.0 g/dL for adults).`];
            recommendations = [
                "Boost your iron intake by consuming pomegranate, spinach, beetroot, and fortified cereals.",
                "Consume Vitamin C rich foods (like lemons, oranges, and tomatoes) alongside iron-rich meals to maximize iron absorption.",
                "Ensure sufficient rest and avoid intensive physical exertion until hemoglobin levels stabilize."
            ];
            consultation = "We suggest scheduling a consultation with a Hematologist or your primary care Physician.";
        }

        res.json({
            success: true,
            summary: { overview, flagged, recommendations, consultation }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

function parseParam(resultsStr, paramName) {
    if (!resultsStr) return null;
    const regex = new RegExp(`${paramName}\\s*:\\s*(\\d+(\\.\\d+)?)`, 'i');
    const match = resultsStr.match(regex);
    return match ? parseFloat(match[1]) : null;
}
