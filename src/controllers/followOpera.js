const User = require("../models/User.js");
const Opera = require("../models/Opera.js").Opera;
const mongoose = require("mongoose");

async function followOpera(optofollow, loggedUser, req, res){
    if(loggedUser && optofollow){
        try{
            const qopera = await Opera.findOne({_id: optofollow});
            let quser = await User.findOne({_id: loggedUser._id});

            if(!qopera){
                res.status(404);
                res.json({
                    success: false,
                    message: "l'opera non esiste"
                });
            }else if(!qopera.visibile){
                res.status(403);
                res.json({
                    success: false,
                    message: "non puoi seguire quest'opera"
                });
            }else{
                quser.operePreferite.push(qopera._id);
                quser.save().then(async ()=>{
                    qopera.nSeguaci += 1;
                    await qopera.save().then(()=>{
                        res.status(200);
                        res.json({
                            success: true,
                            message: "operazione avvenuta con successo"
                        });    
                    }).catch(()=>{
                        res.status(500);
                        res.json({
                            success: false,
                            message: "è avvenuto un errore"
                        });
                    });

                }).catch(()=>{
                    res.status(500);
                    res.json({
                        success: false,
                        message: "è avvenuto un errore"
                    });
                });
            }
        }catch(err){
            if(err instanceof mongoose.Error.CastError){
                res.status(422);
                res.json({
                    success: false,
                    message: "L'id deve essere una stringa di 12 bytes o un intero"
                });
            }else{
                console.log(err);
                res.status(500);
                res.json({
                    success: false,
                    message: "E' avvenuto un errore nel tentativo di recuperare i dati dell'utente"
                });
            }
        }
    }else if(!loggedUser){
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
    }else{
        res.status(400);
        res.json({
            success: false,
            message: "id opera non fornito"
        });
    }
}

module.exports = followOpera;