const mongoose = require("mongoose");
const User = require("../models/User.js");
const Opera = require("../models/Opera.js").Opera;
const bcrypt = require("bcrypt");

async function modifyUser(nome, cognome, username, password, loggedUser, req, res){
    if(loggedUser){
        if(nome || cognome || username || password){
            try{
                let user = await User.findById(loggedUser._id);
                if(nome){
                    user.nome = nome;
                }
                if(cognome){
                    user.cognome = cognome;
                }
                if(password){
                    user.password = await bcrypt.hash(password, 8);
                }
                let oldusername = user.username;
                let usrnamemodified = false;
                if(username){
                    const omonimi = await User.find({                
                        username: username,    
                        _id: { $ne: user._id} 
                    });
                
                    //caso 2
                    if(omonimi.length == 0){
                        user.username = username;                
                        usrnamemodified = true;
                    }
                }
                await user.save()
                if(usrnamemodified){
                    //se ho modificato lo username devo modificare il campo autore nelle opere dello user
                    await Opera.updateMany({autore: oldusername}, {autore: username});

                    res.status(200);
                    res.json({
                        success: true,
                        message: "modifica avvenuta con successo"
                    });
                }else if(username){
                    res.status(403);
                    res.json({
                        success: false,
                        message: "username non valido, eventuali altri dati sono stati modificati"
                    });
                }else{
                    res.status(200);
                    res.json({
                        success: true,
                        message: "modifica avvenuta con successo"
                    });
                }
            }catch(err){
                console.log(err);
                res.status(500);
                res.json({
                    success: false,
                    message: "è avvenuto un errore"
                });
            }
        }else{
            res.status(400);
            res.json({
                success: false,
                message: "Non sono stati specificati parametri da modificare"
            });
        }
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
}

module.exports = modifyUser;