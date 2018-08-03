const passport = require('passport');

exports.login = passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Failed Again',
    successRedirect: '/',
    successFlash: 'You are now logged in!'
});

exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'You are now logged out 👋')
    res.redirect('/');
};

exports.isLoogedIn = (req, res, next) => {
    // first check if the user is authenticated
    if(req.isAuthenticated()){
        next(); // carry on! they are looged in!
        return;
    } 
    req.flash('error', 'You Must be looged in');
    res.redirect('/');
};