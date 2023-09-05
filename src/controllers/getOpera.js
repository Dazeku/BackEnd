const mongoose = require("mongoose");
const Opera = require("../models/Opera.js").Opera;

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
async function getOpera(id, req, res){
    if(id){
        try{
            const operafound = await Opera.findOne({_id: id}).populate("listaCap")  
            //caso 2
            if(operafound){        
                //if non sei autore && l'opera ha visibilità privata
                if((!req.loggedUser || req.loggedUser.username != operafound.autore) && !operafound.visibile){
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
                                message: "token non fornito, non puoi visualizzare un'opera con visibilità privata se non sei autenticato"
                            });
                        }
                    }else{
                        res.status(403);
                        res.json({
                            success: false,
                            message: "non puoi visualizzare quest'opera"
                        });
                    }                
                }else{
                    //if non sei autore ma l'opera ha visibilità pubblica
                    if((!req.loggedUser || req.loggedUser.username != operafound.autore) && operafound.visibile){
                        //filtro in modo che rimangano solo i capitoli con visibilità pubblica
                        operafound.listaCap = operafound.listaCap.filter((cap)=>{
                            return cap.visibile;
                        });
                    }
                    //se sei l'autore dell'opera non entrerai nell'if qui sopra e ti 
                    //verrà inviata l'opera per intero (capitoli privati compresi)
                    res.status(200);
                    res.json({
                        success: true,
                        data: operafound
                    });
                }
            }else{
            //caso 1
                res.status(404);
                res.json({
                    success: false,
                    message: "l'opera non esiste"
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
                    message: "E' avvenuto un errore nel tentativo di recuperare i dati dell'opera"
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

module.exports = getOpera;