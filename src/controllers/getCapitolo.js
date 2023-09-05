const mongoose = require("mongoose");
const Opera = require("../models/Opera.js").Opera;
const Capitolo = require("../models/Capitolo.js").Capitolo;

/*
ricerca un'opera dall'id
casi:
    1. opera non trovata: si notifica
    l'impossibilità di trovare l'opera
    2. opera trovata con successo: si notifica 
    il successo della ricerca e si inviano i dati 
    dell'opera trovata
    3. errore generico: si notifica all'utente
    il fallimento della ricerca causato da un 
    errore generico
        4. l'utente che ha effettuato la richiesta non 
        è loggato o non ha accesso all'opera
    */
async function getCapitolo(id, req, res){
    if(id){
        try{
            const capfound = await Capitolo.findOne({_id: id}); 
            
            //caso 2
            if(capfound){
                const opera = await Opera.findOne({_id: capfound.operaId}).catch((err)=>{
                    console.log(err);
                    res.status(500);
                    res.json({
                        success: false,
                        message: "operazione fallita a causa di un errore"
                    });
                });
                if(!((req.loggedUser && req.loggedUser.username == opera.autore) || (opera.visibile == true && capfound.visibile == true))){
                    if(!req.loggedUser){                    
                        if(req.tcmsg != "no token provided"){
                            res.status(401);
                            res.json({
                                success: false,
                                message: "token non valido"
                            });
                        }else{
                            res.status(403);
                            res.json({
                                success: false,
                                message: "token non fornito, non puoi visualizzare un capitolo con visibilità privata se non sei autenticato"
                            });
                        }
                    }else{
                        res.status(403);
                        res.json({
                            success: false,
                            message: "non puoi visualizzare questo capitolo"
                        });
                    }
                }else{
                    res.status(200);
                    res.json({
                        success: true,
                        data: capfound
                    });
                }
            }else{
            //caso 1
                res.status(404);
                res.json({
                    success: false,
                    message: "il capitolo non esiste"
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
                    message: "E' avvenuto un errore nel tentativo di recuperare i dati del capitolo"
                });
            }
        }
    }else{
        res.status(400);
        res.json({
            success: false,
            message: "non è stato specificato il parametro id"
        });
    }
}

module.exports = getCapitolo;