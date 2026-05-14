const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    labId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lab',
        required: [true, 'Lab ID is required']
    },
    testName: {
        type: String,
        required: [true, 'Test name is required'],
        trim: true,
        maxlength: 200
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Haematology', 'Biochemistry', 'Immunology', 'Virology', 'Microbiology', 'Endocrinology', 'Cardiology', 'Other']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    turnaroundTime: {
        type: String,
        required: [true, 'Turnaround time is required'],
        enum: ['24 hours', '48 hours', '72 hours', '1 week']
    },
    description: {
        type: String,
        default: '',
        maxlength: 500
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Test', testSchema);
