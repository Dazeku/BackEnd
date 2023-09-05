const User = require("../models/User.js");
const Opera = require("../models/Opera.js").Opera;
const mongoose = require("mongoose");

async function unfollowOpera(optounfollow, loggedUser, req, res){
    if(loggedUser && optounfollow){
        try{
            const qopera = await Opera.findOne({_id: optounfollow});
            let quser = await User.findOne({_id: loggedUser._id});

            if(!qopera){
                res.status(404);
                res.json({
                    success: false,
                    message: "l'opera non esiste"
                });
            }else{
            
                let len = quser.operePreferite.length;
                quser.operePreferite = quser.operePreferite.filter((opId)=>{
                    return JSON.stringify(opId) != JSON.stringify(qopera._id);
                });

                let lenmod = len > quser.operePreferite.length;
                if(lenmod){
                    await quser.save();
                    qopera.nSeguaci -= 1;
                    await qopera.save();
                    res.status(200);
                    res.json({
                        success: true,
                        message: "l'opera è stata rimossa dalle opere che segui"
                    });                                
                }else{
                    res.status(200);
                    res.json({
                        success: true,
                        message: "l'opera non era tra le opere seguite"
                    });
                }
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

module.exports = unfollowOpera;