const express = require("express");
const router = express.Router();
const User = require("../models/User.js");
const Opera = require("../models/Opera.js").Opera;
const getOpera = require("../controllers/getOpera.js");
const createOpera = require("../controllers/createOpera.js");
const modifyOpera = require("../controllers/modifyOpera.js");
const deleteOpera = require("../controllers/deleteOpera.js");
const getOpereByTitolo = require("../controllers/getOpereByTitolo.js");
const getMostSuccessfulOperas = require("../controllers/getMostSuccessfulOperas.js");

//crea nuova opera
/*
casi:
    1. l'opera viene creata con successo
    2. l'utente ha già un'opera con lo stesso titolo
    3. errore generico
*/
/*--------AUTH--------*/
router.post("/", (req, res)=>{
    let loggedUser = req.loggedUser;
    let titolo = req.body.titolo;
    let sinossi = req.body.sinossi;
    let generi = req.body.generi;
    createOpera(loggedUser, titolo, sinossi, generi, req, res);    
});

/*------MAYBE AUTH---------*/
router.get("/", (req, res)=>{
    let operaId = req.query.id;
    getOpera(operaId, req, res);
});

/*-----------NOT AUTH(?)---------------*/
//recupera le opere il cui titolo contiene la stringa passata
router.get("/getmany", (req, res)=>{
    if(req.query.titolo){
        getOpereByTitolo(req.query.titolo, req, res);
    }else{
        res.status(400);
        res.json({
            success: false,
            message: "query error"
        });
    }
});

/*-----------NOT AUTH(?)---------------*/
//recupera le opere il cui titolo contiene la stringa passata
router.get("/getmostsuccessful", (req, res)=>{
    getMostSuccessfulOperas(req, res);
});

/*----------AUTH-----------*/
router.patch("/", (req, res)=>{
    let {titolo, sinossi, visibile, id} = req.body;
    let loggedUser = req.loggedUser;
    modifyOpera(titolo, sinossi, visibile, id, loggedUser, req, res);
});

/*-----------AUTH-----------*/
router.delete("/", (req, res)=>{
    let id = req.body.id;
    let loggedUser = req.loggedUser;
    deleteOpera(id, loggedUser, req, res);
});

module.exports = router;


