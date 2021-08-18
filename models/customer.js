var mongoose = require('mongoose');

var customerSchema = mongoose.Schema({
    name: String,
    address: String,
    phone: String,
    zipCode: String,
    tags: String
}, { timestamps: { createdAt: 'created_at' } });

module.exports = mongoose.model('Customer', customerSchema);
