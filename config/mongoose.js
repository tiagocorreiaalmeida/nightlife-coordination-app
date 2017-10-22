const mongoose = require("mongoose");

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DB_URI).then((res)=>{
    console.log("Connected to DB");
}).catch((e)=>{
    console.log(e);
})

module.exports = mongoose;