var Nexmo = require('nexmo');
var Customer = require('../models/customer');
var SmsHistory = require('../models/smsHistory');

class mainController {

    constructor() { }

    login(req, res) {
        res.render('login');
    }

    async index(req, res) {
        let customers = await Customer.find({});
        // let history = await SmsHistory.find({}).limit(100).sort({timestamp: -1});
        res.render('index', { title: 'Vonage', customers: customers });
    }

    async getSMSHistory(req, res) {
        let history = await SmsHistory.find({}).limit(100).sort({ timestamp: -1 });
        res.json({ status: true, history: history });
    }

    async removeSMSHistory(req, res) {
        let { id } = req.params;
        await SmsHistory.deleteOne({ _id: id });
        res.json({ status: true });
    }

    async removeAllSMSHistory(req, res) {
        await SmsHistory.deleteMany({})
        res.json({ status: true });
    }

    async addCustomer(req, res) {
        let { name, phone, zipCode, address, tags } = req.body;
        if (name && phone && zipCode && address && tags) {
            await Customer.create({
                name: name,
                phone: phone,
                zipCode: zipCode,
                address: address,
                tags: tags
            });
        }

        res.redirect('/');
    }

    async getCustomer(req, res) {
        let { id } = req.params;
        let customer = await Customer.findOne({ _id: id });
        res.json({ status: true, customer });
    }

    async editCustomer(req, res) {
        let { id, name, phone, zipCode, address, tags } = req.body;
        await Customer.updateOne({ _id: id }, { name, phone, zipCode, address, tags });
        res.redirect('/');
    }

    async removeCustomer(req, res) {
        let { id } = req.params;
        await Customer.deleteOne({ _id: id });
        res.redirect('/');
    }

    getNumbers(req, res) {

        let apiKey = process.env.API_KEY;
        let apiSecret = process.env.API_SECRET;
        let nexmo = new Nexmo({
            apiKey: apiKey,
            apiSecret: apiSecret
        });

        nexmo.number.get(
            {
            },
            (err, data) => {
                if (err) {
                    console.error(err)
                    res.json({ status: false, phones: [] });
                } else {
                    console.log(`Here are ${data.numbers.length} of your ${data.count} matching numbers:`)
                    let phones = [];
                    for (let i = 0; i < data.numbers.length; i++) {
                        let number = data.numbers[i];
                        phones.push({
                            tel: number.msisdn,
                            cost: number.type
                        })
                    }
                    res.json({ status: true, phones: phones });
                }
            }
        )
    }

    async sendSMS(req, res) {
        let to = req.body.phone;
        let phone = to;
        let customerName = '';
        let customer = await Customer.findOne({ phone: phone });
        if (customer) customerName = customer.name;

        to = to.replace('+', '');
        let from = req.body.senderID;
        let text = req.body.text;

        let apiKey = process.env.API_KEY;
        let apiSecret = process.env.API_SECRET;
        let nexmo = new Nexmo({
            apiKey: apiKey,
            apiSecret: apiSecret
        });

        nexmo.message.sendSms(from, to, text, {
            type: "unicode"
        }, (err, responseData) => {
            console.log(responseData);
            if (err) {
                console.log(err);
            } else {
                if (responseData.messages[0]['status'] === "0") {
                    console.log("Message sent successfully.");
                    res.json({ status: true, phone: phone });
                    SmsHistory.create({
                        customerName: customerName,
                        phone: phone,
                        price: responseData.messages[0]['message-price'],
                        senderID: from,
                        network: responseData.messages[0]['network'],
                        status: 'Sent',
                        timestamp: Date.now(),
                        text: text
                    })
                } else {
                    console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
                    res.json({ status: false, message: responseData.messages[0]['error-text'], phone: to });
                }
            }
        })

    }



}

function getSenderID() {
    var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    let length = 10;
    for (var i = 0; i < length; i++) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}

module.exports = mainController;