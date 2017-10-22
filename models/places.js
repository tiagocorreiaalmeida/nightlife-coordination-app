const mongoose = require("mongoose");

const PlacesSchema = mongoose.Schema({
    id_place:{
        type:String,
        required:true
    },
    users_going:[]
});

const Places = mongoose.model("Places",PlacesSchema);
module.exports = Places;