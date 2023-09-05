const express = require("express");
const router = express.Router();
const User = require("../models/User.js");
const signUp = require("../controllers/signUp.js");
const getUsersByUsername = require("../controllers/getUsersByUsername.js");
const getUser = require("../controllers/getUser.js");
const modifyUser = require("../controllers/modifyUser.js");
const deleteUser = require("../controllers/deleteUser.js");
const followOpera = require("../controllers/followOpera.js");
const unfollowOpera = require("../controllers/unfollowOpera.js");

//signUp
/*
casi:
    1. non esistono altri utenti con lo stesso username e email 
    e l'utente viene registrato con successo
    2. esistono altri utenti con lo stesso username o email 
    e si notifica il fallimento della registrazione
    3. errore generico, si notifica all'utente il fallimento
    della registrazione per un errore generico
*/
router.post("/signUp", (req, res)=>{
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;
    let nome = req.body.nome;
    let cognome = req.body.cognome;
    if(!username || !email || !password || !nome || !cognome){
        res.status(400);
        res.json({
            success: false,
            message: "parametri mancanti"
        });
    }else{
        signUp(username, email, password, nome, cognome, req, res);
    }
});

//get a user data
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
    errore generico
*/
/*----------MAYBE AUTH-------------*/
router.get("/", (req, res)=>{
    if(req.query.id){
        getUser(req.query.id, req, res);
    }else{
        res.status(400);
        res.json({
            success: false,
            message: "query error"
        });
    }
});

/*-----------NOT AUTH(?)---------------*/
//get the users which username contains the given string
router.get("/getmany", (req, res)=>{
    if(req.query.username){
        getUsersByUsername(req.query.username, req, res);
    }else{
        res.status(400);
        res.json({
            success: false,
            message: "query error"
        });
    }
});

/*----------AUTH-----------------*/
router.patch("/", (req, res)=>{
    let {nome, cognome, username, password} = req.body;
    let loggedUser = req.loggedUser;
    modifyUser(nome, cognome, username, password, loggedUser, req, res);
});

/*-----------AUTH-----------*/
router.delete("/", (req, res)=>{
    let loggedUser = req.loggedUser;
    deleteUser(loggedUser, req, res);
});

/*-----------AUTH-----------*/
router.post("/addPref", (req, res)=>{
    let loggedUser = req.loggedUser;
    let id = req.body.id;
    followOpera(id, loggedUser, req, res);
});

/*-----------AUTH-----------*/
router.post("/remPref", (req, res)=>{
    let loggedUser = req.loggedUser;
    let id = req.body.id;
    unfollowOpera(id, loggedUser, req, res);
});

module.exports = router;