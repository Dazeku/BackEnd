const jwt = require("jsonwebtoken");
require("dotenv").config();

const tokenChecker = async function(req, res, next){
    req.loggedUser = null;
    req.tcmsg = "no token provided";
    if(req.body.token || req.cookies.token || req.query.token){
        if(req.body.token){
            jwt.verify(req.body.token, process.env.SUPER_SECRET, (err, decoded)=>{
                if(err){
                    req.tcmsg = "token not valid";
                }else{
                    req.tcmsg = "successfully authenticated";
                    req.loggedUser = decoded;
                }               
            });
        }
        if(!req.loggedUser && req.query.token){
            jwt.verify(req.query.token, process.env.SUPER_SECRET, (err, decoded)=>{
                if(err){
                    req.tcmsg = "token not valid";
                }else{
                    req.tcmsg = "successfully authenticated";
                    req.loggedUser = decoded;
                }               
            });
        }      
        if(!req.loggedUser && req.cookies.token){
            jwt.verify(req.cookies.token, process.env.SUPER_SECRET, (err, decoded)=>{
                if(err){
                    req.tcmsg = "token not valid";
                }else{
                    req.tcmsg = "successfully authenticated";
                    req.loggedUser = decoded;
                }               
            });
        } 
    }
    next();
};

module.exports = tokenChecker;