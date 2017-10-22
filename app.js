require("dotenv").config();
const express = require("express");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const FacebookStrategy = require("passport-facebook");
const TwitterStrategy = require("passport-twitter");
const GoogleStrategy = require("passport-google");
const MongoStore = require("connect-mongo")(session);

const mongoose = require("./config/mongoose");
const routes = require("./routes/routes");

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
    callbackUrl:"http://localhost:3000/auth/facebook/callback"
},(acessToken,refreshToken,profile,done)=>{
    User.findOne({oauthID:profile.id}).then((user)=>{
        if(user){
            return(null,user);
        }else{
            let newUser = new User({
                oauthID:profile.id,
                name:profile.displayName,
                image:"https://www.1plusx.com/app/mu-plugins/all-in-one-seo-pack-pro/images/default-user-image.png",
                social:profile.provider,
                createdAt:moment().format("Do MMMM YYYY"),
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

app.use(passport.initialize());
app.use(passport.session());

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

app.use(routes);

app.listen(3000,()=>{
    console.log("Running on port 3000");
})