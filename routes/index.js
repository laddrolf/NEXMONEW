var express = require('express');
var router = express.Router();
var passport = require('passport');
var mainController = require('../controllers/mainController');
var main = new mainController();

router.get('/login', main.login);
router.get('/', isLoggedIn, main.index);
router.post('/sendSMS', isLoggedIn, main.sendSMS);
router.get('/getNumbers', isLoggedIn, main.getNumbers);
router.post('/addCustomer', isLoggedIn, main.addCustomer);
router.get('/getCustomer/:id', isLoggedIn, main.getCustomer);
router.post('/editCustomer', isLoggedIn, main.editCustomer);
router.get('/removeCustomer/:id', isLoggedIn, main.removeCustomer);
router.get('/getSMSHistory', isLoggedIn, main.getSMSHistory);
router.get('/removeSMSHistory/:id', isLoggedIn, main.removeSMSHistory);
router.get('/removeAllSMSHistory', isLoggedIn, main.removeAllSMSHistory);


router.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    res.redirect('/login');
});
router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/login');
    }
    // return next();
}

module.exports = router;
