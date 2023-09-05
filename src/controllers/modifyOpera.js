const mongoose = require("mongoose");
const User = require("../models/User.js");
const Opera = require("../models/Opera.js").Opera;


async function modifyOpera(titolo, sinossi, visibile, operaId, loggedUser, req, res){
    try{
        if(operaId){
            let qopera = await Opera.findOne({_id: operaId});
            if(qopera){
                if(loggedUser && loggedUser._id == qopera.autoreId){
                    if(titolo || sinossi || (visibile !== undefined && visibile !== null) ){
                        //fai le cose        
                        if(sinossi){
                            qopera.sinossi = sinossi;
                        }
                        if((visibile !== undefined && visibile !== null)){
                            qopera.visibile = visibile;
                        }
                        let titlemodified = false;
                        if(titolo){
                            const omonimi = await Opera.find({                
                                titolo: titolo,    
                                _id: { $ne: qopera._id} 
                            });
                        
                            //caso 2
                            if(omonimi.length == 0){
                                qopera.titolo = titolo;                
                                titlemodified = true;
                            }
                        }

                        await qopera.save();
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
                    }else{
                        res.status(400);
                        res.json({
                            success: false,
                            message: "Non sono stati specificati parametri da modificare"
                        });
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
                        message: "non puoi modificare un'opera non tua"
                    });
                }
            }else{
                res.status(404);
                res.json({
                    success: false,
                    message: "impossibile trovare l'opera"
                });
            }
        }else{
            res.status(400);
            res.json({
                success: false,
                message: "id opera non specificato"
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
                message: "E' avvenuto un errore"
            });
        }
    }
}

module.exports = modifyOpera;