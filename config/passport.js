var LocalStrategy = require('passport-local').Strategy;

module.exports = function (passport) {
    passport.serializeUser(function (admin, done) {
        done(null, "user");
    });

    passport.deserializeUser(function (id, done) {
        done(null, "user");
    });

    passport.use('local-login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },
        function (req, username, password, done) {
            process.nextTick(function () {
                if (password != process.env.PASSWORD)
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                else
                    return done(null, "user");
            });
        }));

};

