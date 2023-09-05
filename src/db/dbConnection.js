const mongoose = require("mongoose");
async function connect(dbUri){
    await mongoose.connect(dbUri).then(()=>{
        console.log("successfully connected");
    }).catch((err)=>{
        console.log("error while trying to connect");
        throw(err);
    });  
}
module.exports = connect;