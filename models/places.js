const mongoose = require("mongoose");

const PlacesSchema = mongoose.Schema({
    id_place:{
        type:String,
        required:true
    },
    name:{
        type:String
    },
    type:{
        type:String
    },
    img:{

    },
    url:{
        type:String
    },
    rating:{
        type:Number
    },
    phone:{
        type:String
    },
    coord:{
        type:String
    },
    address:{
        type:String
    },
    users_going:[]
});
const Places = mongoose.model("Places",PlacesSchema);
module.exports = Places;