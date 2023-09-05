const mongoose = require("mongoose");
const User = require("../models/User.js");


async function deleteUser(loggedUser, req, res){
    try{
        if(loggedUser){
            const user = await User.findOne({_id: loggedUser._id});
            
            await User.deleteOne({_id: user._id}).then(()=>{
                res.status(200);
                res.json({
                    success: true,
                    message: "utente eliminato con successo"            
                });
            }).catch((err)=>{
                console.log(err);
                res.status(500);
                res.json({
                    success: false,
                    message: "è avvenuto un errore"
                });    
            });                
        }else{
            res.status(401);
            if(req.tcmsg == "no token provided"){
                res.json({
                    success: false,
                    message: "token non fornito"
                });
            }else{
                res.json({
                    success: false,
                    message: "token non valido"
                });
            }
        }
    }catch(err){
        console.log(err);
        res.status(500);
        res.json({
            success: false,
            message: "è avvenuto un errore"
        })
    }
}

module.exports = deleteUser;