var express = require('express');
var router = express.Router();
const { FusionAuthClient } = require('@fusionauth/typescript-client');
const clientId = 'fc617d2c-6b2a-4a18-9e77-c2d25db45143';
const clientSecret = '5HnPixFfL24Ok2533F5dL0YhIHr8ep2JIQWz7TAakow';
const client = new FusionAuthClient('noapikeyneeded', 'http://localhost:9011');

/* GET home page. */
router.get('/', function(req, res, next) {
    const stateValue = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    req.session.stateValue = stateValue
    res.render('index', { user: req.session.user, stateValue: stateValue, title: 'Stiff Money' });
});

/* OAuth return from FusionAuth */
router.get('/oauth-redirect', function(req, res, next) {
    // This code stores the user in a server-side session
    const stateFromServer = req.query.state;
    if (stateFromServer !== req.session.stateValue) {
        console.log("State doesn't match.");
        console.log("Saw: " + stateFromServer + ", but expected: " + req.session.stateValue);
        res.redirect(302, '/');
        return;
    }
    client.exchangeOAuthCodeForAccessToken(req.query.code,
            clientId,
            clientSecret,
            'http://localhost:3000/oauth-redirect')
        .then((response) => {
            console.log(response.response.access_token);
            return client.retrieveUserUsingJWT(response.response.access_token);
        })
        .then((response) => {
            req.session.user = response.response.user;
        })
        .then((response) => {
            res.redirect(302, '/');
        }).catch((err) => {
            console.log("in error");
            console.error(JSON.stringify(err));
        });

    // This code pushes the access and refresh tokens back to the browser as secure, HTTP-only cookies
    // client.exchangeOAuthCodeForAccessToken(req.query.code,
    //                                        clientId,
    //                                        clientSecret,
    //                                        'http://localhost:3000/oauth-redirect')
    //     .then((response) => {
    //       res.cookie('access_token', response.response.access_token, {httpOnly: true});
    //       res.cookie('refresh_token', response.response.refresh_token, {httpOnly: true});
    //       res.redirect(302, '/');
    //     }).catch((err) => {console.log("in error"); console.error(JSON.stringify(err));});
});

module.exports = router;