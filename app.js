require("dotenv").config();
const express = require("express");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const FacebookStrategy = require("passport-facebook");
const TwitterStrategy = require("passport-twitter");
const MongoStore = require("connect-mongo")(session);
const moment = require("moment");

const mongoose = require("./config/mongoose");
const routes = require("./routes/routes");
const User = require("./models/user");

app = express();

app.set("views",__dirname+"/views");   
app.set("view engine","hbs");

app.use(express.static(__dirname+"/public"));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(session({
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:false,
    store: new MongoStore({
        mongooseConnection:mongoose.connection
    })
}));

passport.use(new FacebookStrategy({
    clientID: process.env.FB_ID,
    clientSecret:process.env.FB_SECRET,
    callbackURL:"http://localhost:3000/auth/facebook/callback",
    profileFields : ["id","displayName","photos"]
},(accessToken,refreshToken,profile,done)=>{
    console.log(profile);
     User.findOne({oauthID:profile.id}).then((user)=>{
        if(user){
            return(null,user);
        }else{
            let newUser = new User({
                oauthID:profile.id,
                name:profile.displayName,
                photo:profile.photos[0].value,
                createdAt:moment().format("Do MMMM YYYY")
            });
            newUser.save().then((data)=>{
                return(null,user);
            }).catch((e)=>{
                console.log(e);
            });
        }
    }).catch((e)=>{
        console.log(e);
    });
    return done(null,profile); 
}
));

passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_ID,
    consumerSecret: process.env.TWITTER_SECRET,
    callbackURL:"http://127.0.0.1:3000/auth/twitter/callback"
},(accessToken ,refreshToken, profile, done)=>{
    User.findOne({oauthID:profile.id}).then((user)=>{
        if(user){
            return (null,user);
        }else{
            let newUser = new User({
                oauthID:profile.id,
                name:profile.displayName,
                photo:profile.photos[0].value,
                createdAt:moment().format("Do MMMM YYYY")
            });
            newUser.save().then((data)=>{
                return(null,user);
            }).catch((e)=>{
                console.log(e);
            })
        }
    }).catch((e)=>{
        console.log(e);
    });
    return done(null,profile);
}
));

app.use(passport.initialize());
app.use(passport.session());
app.use((req,res,next)=>{
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

passport.serializeUser((user,done)=>{
    done(null,user.id);
});

passport.deserializeUser((id,done)=>{
    User.findOne({oauthID:id}).then((data)=>{
        done(null,data);
    }).catch((e)=>{
        console.log(e);
    })
}); 

hbs.registerPartials(__dirname+"/views/partials");

app.get("/auth/facebook",passport.authenticate("facebook"));
app.get("/auth/facebook/callback",passport.authenticate("facebook",{failureRedirect:"/"}),(req,res)=>{
    res.redirect("/");
});

app.get("/auth/twitter",passport.authenticate("twitter"));
app.get("/auth/twitter/callback",passport.authenticate("twitter",{failureRedirect:"/"}),(req,res)=>{
    res.redirect("/");
});

app.use(routes);

app.get("/logout",(req,res)=>{
    req.logout();
    req.session.destroy();
    res.redirect("/");
});

app.use((req,res,next)=>{
    res.render("404");
});

app.listen(3000,()=>{
    console.log("Running on port 3000");
})