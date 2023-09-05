const mongoose = require("mongoose");
const User = require("../models/User.js");
const Opera = require("../models/Opera.js").Opera;
const Capitolo = require("../models/Capitolo.js").Capitolo;

//crea nuova opera
/*
casi:
    1. l'opera viene creata con successo
    2. l'utente ha già un'opera con lo stesso titolo
    3. errore generico
*/
async function createCapitolo(loggedUser, operaId, titolo, testo, req, res){
    /*
        devo trovare un capitolo appartenente 
        alla stessa opera con lo stesso titolo
        in più dovrei controllare che l'opera in questione 
        sia effettivamente dell'utente loggato
    */
    //check che l'opera appartenga all'utente loggato
    if(loggedUser){
        if(operaId && titolo && testo){
            try{
                let operaPopulated = await Opera.findOne({
                    _id: operaId
                });
                if(operaPopulated != null){
                    let checkUser = await User.findOne({
                        _id: loggedUser._id,
                        opereProdotte: operaPopulated
                    });
                    await operaPopulated.populate("listaCap");

                    if(checkUser){
                        //in questo caso l'opera appartiente all'utente loggato
                        let capitoloOmonimo = operaPopulated.listaCap.filter((cap)=>{
                            return cap.titolo == titolo;
                        });

                        if(capitoloOmonimo.length != 0){
                            //in questo caso è stato trovato un capitolo con lo stesso titolo
                            res.status(403);
                            res.json({
                                success: false,
                                message: "un altro capitolo appartenente alla stessa opera ha lo stesso titolo"
                            });
                        }else{  
                            //caso 1
                            let newCapitolo = new Capitolo({
                                titolo: titolo,
                                operaId: operaId,
                                testo: testo,
                                visibile: false,
                                numero: (operaPopulated.listaCap.length + 1)
                            });
                        
                            let capitoloId = await newCapitolo.save()

                            operaPopulated.depopulate("listaCap");

                            operaPopulated.listaCap.push(capitoloId._id);
                            await Opera.updateOne(
                                { _id: operaPopulated._id },
                                { $push: { listaCap: capitoloId._id } }
                            );
                            res.status(200);
                            res.json({
                                success: true,
                                message: "chapter successfully created"
                            });
                        }            
                    }else{
                        res.status(403);
                        res.json({
                            success: false,
                            message: "non puoi pubblicare un capitolo in un'opera che non hai prodotto"
                        });
                    }
                }else{
                    res.status(404);
                    res.json({
                        success: false,
                        message: "L'opera specificata non esiste"
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
                message: "mancano uno o più parametri"
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

module.exports = createCapitolo;