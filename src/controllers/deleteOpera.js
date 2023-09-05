const mongoose = require("mongoose");
const Opera = require("../models/Opera.js").Opera;const Capitolo = require("../models/Capitolo.js").Capitolo;
const User = require("../models/User.js");


async function deleteOpera(operaId, loggedUser, req, res){
    if(loggedUser){
        if(operaId){  
            try{  
                const qopera = await Opera.findOne({_id: operaId});
                if(qopera){
                    if(qopera.autoreId == loggedUser._id){
                        await Opera.deleteOne({_id: qopera._id}).then(()=>{
                            res.status(200);
                            res.json({
                                success: true,
                                message: "opera eliminata con successo"
                            });
                        });   
                    }else{
                        res.status(403);
                        res.json({
                            success: false,
                            message: "non puoi eliminare un'opera che non appartiene a te"
                        });
                    }
                }else{
                    res.status(404);
                    res.json({
                        success: false,
                        message: "opera non trovata"
                    })
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
        }else{
            res.status(400);
            res.json({
                success: false,
                message: "id opera non specificato"
            })
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

module.exports = deleteOpera;