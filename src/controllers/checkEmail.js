const mongoose = require("mongoose");
const User = require("../models/User.js");
const jwt = require("jsonwebtoken");

async function checkEmail(mctoken, req, res){
    try{
        if(mctoken){
            jwt.verify(mctoken, process.env.SUPER_SECRET, (err, decoded)=>{
                if(err){
                    res.status(403);
                    res.json({
                        success: false,
                        message: "token non valido"
                    });
                }else{
                    User.updateOne({
                        _id: decoded.id
                    },
                    {
                        emailChecked: true
                    }).then(()=>{
                        res.status(200);
                        res.json({
                            success: true,
                            message: "email verificata con successo"
                        });                               
                    }).catch((err)=>{
                        res.status(500);
                        res.json({
                            success: true,
                            message: "Utente non trovato"
                        });
                    });      
                }                    
            });
        }else{
            res.status(400);
            res.json({
                success: false,
                message: "parametro mctoken non specificato"
            });
        }
    }catch(err){
        res.status(500);
        res.json({
            success: false,
            message: "è avvenuto un errore"
        });
    }
}

module.exports = checkEmail;