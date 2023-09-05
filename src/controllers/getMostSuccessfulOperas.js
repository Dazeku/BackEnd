const mongoose = require("mongoose");
const Opera = require("../models/Opera.js").Opera;

async function getMostSuccessfulOperas(req, res){
    try{
        //console.log(new RegExp(".*"+username+".*"));
        let opereFound = await Opera.find({
            visibile: true
        }).limit(20).sort({nSeguaci: -1});

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

module.exports = getMostSuccessfulOperas;