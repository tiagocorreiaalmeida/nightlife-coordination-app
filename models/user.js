const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    oauthID:{
        type:Number,
        required:true
    },
    name:{
        type:String,
    },
    photo:{
        type:String
    },
    createdAt:{
        type:String,
        required:true
    }
});

const User = mongoose.model("User",UserSchema);
module.exports = User;