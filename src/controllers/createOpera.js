const mongoose = require("mongoose");
const User = require("../models/User.js");
const Opera = require("../models/Opera.js").Opera;

//crea nuova opera
/*
casi:
    1. l'opera viene creata con successo
    2. l'utente ha già un'opera con lo stesso titolo
    3. errore generico
*/
async function createOpera(loggedUser, titolo, sinossi, generi, req, res){
    if(loggedUser){
        if(titolo && sinossi && generi){
            try{
                let operaOmonima = await Opera.find({
                    titolo: titolo, 
                    autore: loggedUser.username
                });

                //caso 2
                if(operaOmonima.length != 0){
                    res.status(403);
                    res.json({
                        success: false,
                        message: "Esiste già un'opera con lo stesso titolo"
                    });
                }else{
                    let generiAmmessi = ["horror", "fantasy", "fantascienza", "thriller", "combattimento", "storico", "giallo"];
                    //caso 1
                    let newOpera = new Opera({
                        autore: loggedUser.username,
                        autoreId: loggedUser._id,
                        titolo: titolo,
                        sinossi: sinossi,
                        visibile: false,
                        generi: generi.split(' ').filter(e => generiAmmessi.includes(e)),
                        nSeguaci: 0
                    });

                    let operaId = await newOpera.save();

                    let autore = await User.findOne({
                        username: loggedUser.username
                    });

                    autore.opereProdotte.push(operaId._id);
                    autore.save().then(()=>{
                        res.status(200);
                        res.json({
                            success: true,
                            message: "creazione opera avvenuta con successo",
                            id: operaId._id
                        });
                    });
                }
            }catch(err){
                console.log(err);
                res.status(500);
                res.json({
                    success: false,
                    message: "E' avvenuto un errore"
                });
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

module.exports = createOpera;
