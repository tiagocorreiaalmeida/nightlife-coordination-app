const FacebookStrategy = require("passport-facebook");
const TwitterStrategy = require("passport-twitter");
const moment = require("moment");

const User = require("../models/user");

module.exports = (passport)=>{
    passport.use(new FacebookStrategy({
        clientID: process.env.FB_ID,
        clientSecret:process.env.FB_SECRET,
        callbackURL:"http://localhost:3000/auth/facebook/callback",
        profileFields : ["id","displayName","photos"]
    },(accessToken,refreshToken,profile,done)=>{
         User.findOne({oauthID:profile.id}).then((user)=>{
            if(user) return user;
                return new User({
                    oauthID:profile.id,
                    name:profile.displayName,
                    photo:profile.photos[0].value,
                    createdAt:moment().format("Do MMMM YYYY")
                }).save()
        }).then((user)=>done(null,user))
        .catch((e)=>done(e));
    }
    ));
    
    passport.use(new TwitterStrategy({
        consumerKey: process.env.TWITTER_ID,
        consumerSecret: process.env.TWITTER_SECRET,
        callbackURL:"http://127.0.0.1:3000/auth/twitter/callback"
    },(accessToken ,refreshToken, profile, done)=>{
        User.findOne({oauthID:profile.id}).then((user)=>{
            if(user) return user;
            return newUser = newUser({
                oauthID:profile.id,
                name:profile.displayName,
                photo:profile.photos[0].value,
                createdAt:moment().format("Do MMMM YYYY")
            }).save()
        }).then((user)=>done(null,user))
        .catch((e)=>done(e));
    }
    ));
    
    passport.serializeUser((user,done)=>{
        done(null,user.id);
    });
    
    passport.deserializeUser((id,done)=>{
        User.findById({_id:id})
        .then((data)=>done(null,data))
        .catch((e)=>{
            console.log(e);
        })
    }); 
}

