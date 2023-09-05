const mongoose = require("mongoose");
const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const validator = require("email-validator");
const {passwordStrength} = require("check-password-strength");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config({path: path.resolve(__dirname, "../../config/all.env")});
require("dotenv").config({path: path.resolve(__dirname, "../../secrets.env")});
const nodemailer = require('nodemailer');


/*
casi:
    1. non esistono altri utenti con lo stesso username e email 
    e l'utente viene registrato con successo
    2. esistono altri utenti con lo stesso username o email 
    e si notifica il fallimento della registrazione
    3. errore generico, si notifica all'utente il fallimento
    della registrazione per un errore generico
*/

async function signUp(username, email, password, nome, cognome, req, res){
    try{
        let hashedPass = await bcrypt.hash(password, 8);
        if(validator.validate(email)){
            const omonimo = await User.findOne({
                username: username                    
            });
            const sameEmail = await User.findOne({
                email: email
            });
        
            /*
            casi:
            - se un altro utente ha la stessa mail ma non è stata verificata e o non esistono altri utenti con lo stesso username o l'utente con lo stesso username corrispode a quello con la stessa mail sovrascrivo l'utente
            - se un altro utente ha la stessa mail ed è stata verificata oppure un altro utente ha lo stesso username e non rientriamo nel caso di sopra 403 forbidden
            - altrimenti creiamo l'utente normalmente
            quindi:
            - se la mail è uguale
            */
            // caso 1
            if(sameEmail && !sameEmail.emailChecked && (!omonimo || omonimo._id.valueOf() == sameEmail._id.valueOf())){
                //controllo sicurezza password
                let checkSubset = (parentArray, subsetArray) => {
                    return subsetArray.every((el) => {
                        return parentArray.includes(el);
                    });
                };
                if(checkSubset(passwordStrength(password).contains, ["lowercase", "uppercase", "number"]) && passwordStrength(password).length >= 8){
                    let emailToCheck = false;
                    if(process.env.CHECK_EMAIL == "true" && process.env.TESTING == "false"){
                        //invia la mail di verifica
                        emailToCheck = true;
                    }
                    new_user = new User({
                        nome: nome,
                        cognome: cognome,
                        email: email,
                        password: hashedPass,
                        username: username,
                        emailChecked: !emailToCheck
                    });
                    let savedUser = await new_user.save();//controllo sicurezza password
                    let checkSubset = (parentArray, subsetArray) => {
                        return subsetArray.every((el) => {
                            return parentArray.includes(el);
                        });
                    };
                    if(checkSubset(passwordStrength(password).contains, ["lowercase", "uppercase", "number"]) && passwordStrength(password).length >= 8){
                        let emailToCheck = false;
                        if(process.env.CHECK_EMAIL == "true" && process.env.TESTING == "false"){
                            //invia la mail di verifica
                            emailToCheck = true;
                        }

                        let savedUser = await User.updateOne({
                            _id: sameEmail._id.valueOf()
                        },
                        {
                            nome: nome,
                            cognome: cognome,
                            email: email,
                            password: hashedPass,
                            username: username,
                            emailChecked: !emailToCheck
                        });
                        
                        if(emailToCheck){
                            var payload = {id: savedUser._id.valueOf()};
        
                            var options = {expiresIn: 86400*7};
    
                            var token = jwt.sign(payload, process.env.SUPER_SECRET, options);
    
                            ////invia la mail di verifica                        
                            //sendmail({
                            //    from: 'mailChecker@dazeku.com',
                            //    to: email,
                            //    subject: "verifica email", // Subject line
                            //    html: "Verifica la tua email al link "+process.env.API_HOST+"/checkEmail?mctoken="+token
                            //}, function (err, reply) {
                            //    console.log(err && err.stack);
                            //    console.dir(reply);
                            //});
                            
    
                            const transporter = nodemailer.createTransport({
                                service: 'ElasticEmail', 
                                auth: {
                                    user: process.env.MAIL_ADDR, 
                                    pass: process.env.MAIL_PASS, 
                                },
                                port: 2525,
                                host: "smtp.elasticemail.com"
                            });
    
                            const mailOptions = {
                                from: process.env.MAIL_ADDR,
                                to: email,
                                subject: 'Codice di verifica dazeku',
                                text: "Verifica la tua email al link "+process.env.API_HOST+"/checkEmail?mctoken="+token
                            };
    
                            transporter.sendMail(mailOptions, (error, info) => {
                                if (error) {
                                    console.log('Errore durante l\'invio dell\'email:', error);
                                } else {
                                    console.log('Email inviata:', info.response);
                                }
                            });
                        }
                        //caso 1
                        res.status(200);
                        res.json({
                            success: true,
                            message: "registrazione avvenuta",
                        });
                    }else{
                        res.status(403);
                        res.json({
                            success: false,
                            message: "la password non rispetta i requisiti di sicurezza"
                        });
                    }

                    
                    
                    if(emailToCheck){
                        var payload = {id: savedUser._id.valueOf()};
    
                        var options = {expiresIn: 86400*7};

                        var token = jwt.sign(payload, process.env.SUPER_SECRET, options);

                        ////invia la mail di verifica                        
                        //sendmail({
                        //    from: 'mailChecker@dazeku.com',
                        //    to: email,
                        //    subject: "verifica email", // Subject line
                        //    html: "Verifica la tua email al link "+process.env.API_HOST+"/checkEmail?mctoken="+token
                        //}, function (err, reply) {
                        //    console.log(err && err.stack);
                        //    console.dir(reply);
                        //});
                        

                        const transporter = nodemailer.createTransport({
                            service: 'ElasticEmail', 
                            auth: {
                                user: process.env.MAIL_ADDR, 
                                pass: process.env.MAIL_PASS, 
                            },
                            port: 2525,
                            host: "smtp.elasticemail.com"
                        });

                        const mailOptions = {
                            from: process.env.MAIL_ADDR,
                            to: email,
                            subject: 'Codice di verifica dazeku',
                            text: "Verifica la tua email al link "+process.env.API_HOST+"/checkEmail?mctoken="+token
                        };

                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.log('Errore durante l\'invio dell\'email:', error);
                            } else {
                                console.log('Email inviata:', info.response);
                            }
                        });
                    }
                    //caso 1
                    res.status(200);
                    res.json({
                        success: true,
                        message: "registrazione avvenuta",
                    });
                }else{
                    res.status(403);
                    res.json({
                        success: false,
                        message: "la password non rispetta i requisiti di sicurezza"
                    });
                }
            }else if((sameEmail && sameEmail.emailChecked) || (omonimo && !(sameEmail && !sameEmail.emailChecked && omonimo._id.valueOf() == sameEmail._id.valueOf()))){ //caso 2
                res.status(403);
                res.json({
                    success: false,
                    message: "username o email già in uso"
                });
            }else{ // caso 3
                //controllo sicurezza password
                let checkSubset = (parentArray, subsetArray) => {
                    return subsetArray.every((el) => {
                        return parentArray.includes(el);
                    });
                };
                if(checkSubset(passwordStrength(password).contains, ["lowercase", "uppercase", "number"]) && passwordStrength(password).length >= 8){
                    let emailToCheck = false;
                    if(process.env.CHECK_EMAIL == "true" && process.env.TESTING == "false"){
                        //invia la mail di verifica
                        emailToCheck = true;
                    }
                    new_user = new User({
                        nome: nome,
                        cognome: cognome,
                        email: email,
                        password: hashedPass,
                        username: username,
                        emailChecked: !emailToCheck
                    });
                    let savedUser = await new_user.save();
                    
                    if(emailToCheck){
                        var payload = {id: savedUser._id.valueOf()};
    
                        var options = {expiresIn: 86400*7};

                        var token = jwt.sign(payload, process.env.SUPER_SECRET, options);

                        ////invia la mail di verifica                        
                        //sendmail({
                        //    from: 'mailChecker@dazeku.com',
                        //    to: email,
                        //    subject: "verifica email", // Subject line
                        //    html: "Verifica la tua email al link "+process.env.API_HOST+"/checkEmail?mctoken="+token
                        //}, function (err, reply) {
                        //    console.log(err && err.stack);
                        //    console.dir(reply);
                        //});
                        

                        const transporter = nodemailer.createTransport({
                            service: 'ElasticEmail', 
                            auth: {
                                user: process.env.MAIL_ADDR, 
                                pass: process.env.MAIL_PASS, 
                            },
                            port: 2525,
                            host: "smtp.elasticemail.com"
                        });

                        const mailOptions = {
                            from: process.env.MAIL_ADDR,
                            to: email,
                            subject: 'Codice di verifica dazeku',
                            text: "Verifica la tua email al link "+process.env.API_HOST+"/checkEmail?mctoken="+token
                        };

                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.log('Errore durante l\'invio dell\'email:', error);
                            } else {
                                console.log('Email inviata:', info.response);
                            }
                        });
                    }
                    //caso 1
                    res.status(200);
                    res.json({
                        success: true,
                        message: "registrazione avvenuta",
                    });
                }else{
                    res.status(403);
                    res.json({
                        success: false,
                        message: "la password non rispetta i requisiti di sicurezza"
                    });
                }
            }
            //caso 2
              
        }else{
            res.status(403);
            res.json({
                success: false,
                message: "email non valida"
            });
        }
    }catch(err){
        console.log(err);
        res.status(500);
        res.json({
            success: false,
            message: "è avvenuto un errore"
        });
    }
}   

module.exports = signUp;