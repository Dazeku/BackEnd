const mongoose = require("mongoose");
const Opera = require("../models/Opera.js").Opera;

async function getOpereByTitolo(titolo, req, res){
    try{
        //console.log(new RegExp(".*"+username+".*"));
        let opereFound = await Opera.find({
            titolo: new RegExp(titolo),
            visibile: true
        });

        res.status(200);
        res.json({
            success: true,
            data: opereFound
        });

    }catch(err){
        console.log(err);
        res.status(500);
        res.json({
            success: false,
            message: "operazione fallita a causa di un errore"
        });
    }
}

module.exports = getOpereByTitolo;