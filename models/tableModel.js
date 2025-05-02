const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    tableNumber: {
        type: String,
        required: true,
        trim: true
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ['Available', 'Reserved', 'Occupied', 'Cleaning', 'Out of Service'],
        default: 'Available'
    },
    currentOcupancy: {
        type: Number,
        default: 0,
        min: 0
    },
    qrCodeIdentifier: {
        type: String,
        required: true,
        unique: true
    }
}, {timestamps: true});

const Table = mongoose.model('Table', tableSchema);
module.exports = Table;