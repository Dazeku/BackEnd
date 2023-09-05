const mongoose = require("mongoose");
const User = require("../models/User.js");
const Opera = require("../models/Opera.js").Opera;
const Capitolo = require("../models/Capitolo.js").Capitolo;


async function modifyCapitolo(titolo, testo, visibile, id, loggedUser, req, res){
    try{
        if(id){
            let qcap = await Capitolo.findOne({_id: id});
            if(qcap){
                let qopera = await Opera.findOne({_id: qcap.operaId});
                if(loggedUser && loggedUser._id == qopera.autoreId){
                    //fai le cose
                    if(titolo || testo || (visibile !== undefined && visibile !== null)){
                        if(testo){
                            qcap.testo = testo;
                        }
                        if((visibile !== undefined && visibile !== null)){
                            qcap.visibile = visibile;
                        }

                        let titlemodified = false;
                        if(titolo){
                            const omonimi = await Capitolo.find({                
                                titolo: titolo,    
                                _id: { $ne: qcap._id},
                                operaId: qopera._id
                            });
                        
                            //caso 2
                            if(omonimi.length == 0){
                                qcap.titolo = titolo;                
                                titlemodified = true;
                            }
                        }

                        qcap.save().then(()=>{
                            if(titlemodified){
                                res.status(200);
                                res.json({
                                    success: true,
                                    message: "modifica avvenuta con successo"
                                });
                            }else if(titolo){
                                res.status(403);
                                res.json({
                                    success: false,
                                    message: "titolo non valido, eventuali altri dati sono stati modificati"
                                });
                            }else{
                                res.status(200);
                                res.json({
                                    success: true,
                                    message: "modifica avvenuta con successo"
                                });
                            }
                        }).catch(()=>{
                            res.status(500);
                            res.json({
                                success: false,
                                message: "è avvenuto un errore"
                            });
                        });
                    }else{
                        res.status(400);
                        res.json({
                            success: false,
                            message: "Non sono stati specificati parametri da modificare"
                        })
                    }
                }else if(loggedUser === null){
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
                    res.status(403);
                    res.json({
                        success: false,
                        message: "non puoi modificare un capitolo non tuo"
                    });
                }
            }else{
                res.status(404);
                res.json({
                    success: false,
                    message: "capitolo non trovato"
                });
            }
        }else{
            res.status(400);
            res.json({
                success: false,
                message: "id capitolo non specificato"
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
}

module.exports = modifyCapitolo;