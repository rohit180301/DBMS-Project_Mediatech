const passport = require('passport');
const keys = require('../config/keys');
const User = require('../models/user');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new LinkedInStrategy({
        clientID: keys.LinkedINClientID,
        clientSecret: keys.LinkedINClientSecret,
        callbackURL: "/auth/linkedin/callback",
        scope: ['r_emailaddress', 'r_liteprofile'],
        proxy: true
    },
    (accessToken, refreshToken, profile, done) => {
        console.log(profile);
        User.findOne({linkedin: profile.id})
        .then((user) =>{
            if(user){
                done(null, user);
            }else{
                const newUser = {
                    linkedin: profile.id,
                    fullname: profile.displayName,
                    lastname : profile.name.familyName,
                    firstname : profile.name.givenName,
                    email : profile.emails[0].value,
                    image : profile.photos[0].value
                }
                new User(newUser).save()
                .then((user) => {
                    done(null,user);
                })
            }
        })
    }
));