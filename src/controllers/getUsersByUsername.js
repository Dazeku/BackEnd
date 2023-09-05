const mongoose = require("mongoose");
const User = require("../models/User.js");

async function getUsersByUsername(username, req, res){
    try{
        //console.log(new RegExp(".*"+username+".*"));
        let usersFound = await User.find({
            username: new RegExp(username)
        });

        res.status(200);
        res.json({
            success: true,
            data: usersFound
        });
                
    }catch(err){
        console.log(err);
        res.status(500);
        res.json({
            success: false,
            message: "è avvenuto un errore"
        });
    }
}

module.exports = getUsersByUsername;