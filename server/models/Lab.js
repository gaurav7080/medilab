const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Lab name is required'],
        trim: true,
        maxlength: 100
    },
    location: {
        type: String,
        required: [true, 'Lab location is required'],
        trim: true,
        maxlength: 100
    },
    phone: {
        type: String,
        default: ''
    },
    gstNumber: {
        type: String,
        default: ''
    },
    labId: {
        type: String,
        default: ''
    },
    profile: {
        type: String,
        default: '',
        maxlength: 500
    },
    status: {
        type: String,
        enum: ['Pending', 'Verified', 'Rejected'],
        default: 'Pending'
    },
    registeredDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Lab', labSchema);
