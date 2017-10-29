require("dotenv").config();
const express = require("express");
const hbs = require("hbs");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

const passportConfig = require("./controllers/passport");
const mongoose = require("./config/mongoose");
const routes = require("./routes/routes");
const User = require("./models/user");


passportConfig(passport);

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

app.use(passport.initialize());
app.use(passport.session());
app.use((req,res,next)=>{
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

hbs.registerPartials(__dirname+"/views/partials");

app.get("/auth/facebook",passport.authenticate("facebook"));
app.get("/auth/facebook/callback",passport.authenticate("facebook",{failureRedirect:"/"}),(req,res)=>{
    console.log(req);
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