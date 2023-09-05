const mongoose = require("mongoose");
const Opera = require("../models/Opera.js").Opera;
const Capitolo = require("../models/Capitolo.js").Capitolo;


async function deleteCapitolo(capId, loggedUser, req, res){
    if(loggedUser){
        if(capId){
            try{
                const qcap = await Capitolo.findOne({_id: capId});
                if(qcap){
                    const opera = await Opera.findOne({_id: qcap.operaId});
                    if(JSON.stringify(opera.autoreId) == JSON.stringify(loggedUser._id)){
                        await Capitolo.updateMany({
                            operaId: qcap.operaId,
                            numero: {$gt: qcap.numero}
                        },
                        {
                            $inc: {numero: -1}
                        }).exec();
                        await Capitolo.deleteOne({_id: qcap._id});

                        res.status(200);
                        res.json({
                            success: true,
                            message: "capitolo eliminato con successo"
                        });
                    }else{
                        res.status(403);
                        res.json({
                            success: false,
                            message: "non puoi eliminare un capitolo che non appartiene a una tua opera"
                        });
                    }
                }else{
                    res.status(404);
                    res.json({
                        success: false,
                        message: "capitolo non trovato"
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
                message: "id capitolo non specificato"
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

module.exports = deleteCapitolo;