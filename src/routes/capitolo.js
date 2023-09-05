const express = require("express");
const router = express.Router();
const User = require("../models/User.js");
const Opera = require("../models/Opera.js").Opera;
const Capitolo = require("../models/Capitolo.js").Capitolo;
const createCapitolo = require("../controllers/createCapitolo.js");
const modifyCapitolo = require("../controllers/modifyCapitolo.js");
const deleteCapitolo = require("../controllers/deleteCapitolo.js");
const getCapitolo = require("../controllers/getCapitolo.js");

//crea nuovo capitolo
/*
casi:
    1. l'opera viene creata con successo
    2. l'utente ha già un'opera con lo stesso titolo
    3. errore generico
*/
/*------------AUTH------------------*/
router.post("/", (req, res)=>{
    let loggedUser = req.loggedUser;
    let titolo = req.body.titolo;
    let id = req.body.id;
    let testo = req.body.testo;
    createCapitolo(loggedUser, id, titolo, testo, req, res);
});

/*------MAYBE AUTH---------*/
router.get("/", (req, res)=>{
    let capId = req.query.id;
    getCapitolo(capId, req, res);
});

/*----------AUTH-----------*/
router.patch("/", (req, res)=>{
    let {titolo, testo, visibile, id} = req.body;
    let loggedUser = req.loggedUser;
    modifyCapitolo(titolo, testo, visibile, id, loggedUser, req, res);
});

/*-----------AUTH-----------*/
router.delete("/", (req, res)=>{
    let id = req.body.id;
    let loggedUser = req.loggedUser;
    deleteCapitolo(id, loggedUser, req, res);
});




module.exports = router;


