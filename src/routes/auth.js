const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const { isUndefined } = require("util");
require("dotenv").config();

//autenticazione
/*
casi:
    1. autenticato con successo
    2. wrong email or password
    3. errore generico
*/
router.post("/", async function(req, res){
    if(req.body.email && req.body.password){
        User.findOne({email: req.body.email}).then((user)=>{
            if(!user){
                res.status(403);
                res.json({
                    success: false,
                    message: "email o password errate"
                });
            }else{
                if(user.emailChecked != false || process.env.CHECK_EMAIL == "false" || process.env.TESTING == "true"){
                    if(!bcrypt.compare(req.body.password, user.password)){
                        res.status(403);
                        res.json({
                            success: false,
                            message: "email o password errate"
                        });
                    }else{
                        var payload = user.toJSON();
            
                        var options = {expiresIn: 86400};
            
                        var token = jwt.sign(payload, process.env.SUPER_SECRET, options);
                        let filteredUser = {
                            _id: user._id,
                            username: user.username,
                            nome: user.nome,
                            cognome: user.cognome,
                            email: user.email,
                            opereProdotte: user.opereProdotte,
                            operePreferite: user.operePreferite
                        };
                        res.status(200);
                        res.cookie("token", token, {maxAge: 86400});
                        res.json({
                            success: true,
                            token: token, 
                            user: filteredUser
                        });
                    }
                }else{
                    res.status(403);
                    res.json({
                        success: false,
                        message: "email non verificata"
                    });
                }
            }
        }).catch((err)=>{
            console.log(err);
            res.status(500);
            res.json({
                success: false,
                message: "E' avvenuto un errore"
            });
        });
    }else{
        res.status(400);
        res.json({
            success: false,
            message: "email e/o password non specificate"
        });
    }    
});

module.exports = router;