const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    labId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lab',
        required: [true, 'Lab ID is required']
    },
    testName: {
        type: String,
        required: [true, 'Test name is required'],
        trim: true
    },
    patientName: {
        type: String,
        required: true,
        trim: true
    },
    patientEmail: {
        type: String,
        required: true,
        trim: true
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    testDate: {
        type: String,
        default: ''
    },
    testTime: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: '',
        maxlength: 500
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Completed', 'Cancelled'],
        default: 'Pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
