var mongoose = require('mongoose');

var smsHistorySchema = mongoose.Schema({
    customerName: String,
    phone: String,
    price: Number,
    senderID: String,
    network: String,
    status: String,
    timestamp: Number,
    text: String
}, { timestamps: { createdAt: 'created_at' } });

module.exports = mongoose.model('SmsHistory', smsHistorySchema);
