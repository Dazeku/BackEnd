const mongoose = require("mongoose");
const User = require("../models/User.js");
const { request } = require("express");
const Opera = require("../models/Opera.js").Opera;

/*
ricerca un utente dall'id
casi:
    1. utente non trovato: si notifica
    l'impossibilità di trovare l'utente
    2. utente trovato con successo: si notifica 
    il successo della ricerca e si inviano i dati 
    dell'utente trovato
    3. errore generico: si notifica all'utente
    il fallimento della ricerca causato da un 
    erroe generico
*/
async function getUser(id, req, res){
    /*let userfound = await*/ User.findById(id).populate("opereProdotte").then((userfound)=>{
        if(userfound){
            /* 
            qui si controlla se l'utente di cui 
            sono stati richiesti i dati coincide con l'utente
            che ha eseguito la richiesta, in tal caso 
            vengono mostrate anche le opere con visibilità privata
            */
            let filteredUser = {};
            filteredUser._id = userfound._id.valueOf();
            filteredUser.username = userfound.username;
            filteredUser.nome = userfound.nome;
            filteredUser.cognome = userfound.cognome;

            if(!(req.loggedUser && req.loggedUser._id == userfound._id)){
                if(userfound.opereProdotte.length != 0){
                    userfound.opereProdotte = userfound.opereProdotte.filter((op)=>{
                        return op.visibile == true;
                    });
                }
            }else{
                filteredUser.email = userfound.email;
            }
            filteredUser.opereProdotte = userfound.opereProdotte;
            filteredUser.operePreferite = userfound.operePreferite;
            res.status(200);
            res.json({
                success: true,
                data: filteredUser
            });
        }else{
        //caso 1
            res.status(404);
            res.json({
                success: false,
                message: "l'utente non esiste"
            });
        }
    }).catch((err)=>{
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
    }); 
}


module.exports = getUser;