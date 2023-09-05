const request = require("supertest");
const mongoose = require("mongoose");
const User = require("../src/models/User.js");
const Opera = require("../src/models/Opera.js").Opera;
const appGen = require("../src/app.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const path = require("path");
require("dotenv").config({path: path.resolve(__dirname, "../config/all.env")});

process.env.TESTING = "true";

let app;

beforeAll(async () => {
    app = await appGen();
});

afterAll(async () => {
    mongoose.disconnect();
});

let gUsers = [];

async function createUsers(){    
    let nomi = ["user1", "user2", "user3"];
    let usernames = ["user1", "user2", "user3"];
    let passwords = ["Password1", "Password2", "Password3"];
    let emails = ["user1@user1.com", "user2@user2.com", "user3@user3.com"];
    let hashedPasswords = [];
    hashedPasswords[0] = await bcrypt.hash(passwords[0], 8);
    hashedPasswords[1] = await bcrypt.hash(passwords[1], 8);
    hashedPasswords[2] = await bcrypt.hash(passwords[2], 8);
    let users = [];

    for(let i = 0; i < 3; i++){
        users[i] = {    
            nome: nomi[i],
            cognome: nomi[i],
            email: emails[i],
            password: hashedPasswords[i],
            username: usernames[i],
            opereProdotte: [],
            operePreferite: [],
            emailChecked: true
        };    
    }

    gUsers = await User.insertMany(users);
}

let gOperas = [];

let tokens = [];

async function createOperas(){
    let titoli = ["u1o1", "u1o2", "u2o1", "u2o2", "u3o1", "u3o2"];
    let sinossi = ["u1s1", "u1s2", "u2s1", "u2s2", "u3s1", "u3s2"];
    let autori = [gUsers[0].username, gUsers[0].username, gUsers[1].username, gUsers[1].username, gUsers[2].username, gUsers[2].username];
    let autoriId = [gUsers[0]._id, gUsers[0]._id, gUsers[1]._id, gUsers[1]._id, gUsers[2]._id, gUsers[2]._id]
    let visibili = [true, false, true, false, true, false];
    let generi = [["horror"], ["horror"], ["horror"], ["horror"], ["horror"], ["horror"]];
    let operas = [];

    for(let i = 0; i < 6; i++){
        operas[i] = {    
            titolo: titoli[i],
            sinossi: sinossi[i],
            autore: autori[i],
            autoreId: autoriId[i],
            visibile: visibili[i],
            generi: generi[i],
            nSeguaci: (visibili[i])?(1):(0)        
        };    
    }
    
    gOperas = await Opera.insertMany(operas);

    //gUsers[0] = await User.updateOne(
    //    {_id: gUsers[0]._id},
    //    {
    //      // Usa l'operatore $push per aggiungere elementi all'array
    //      $push: {
    //        items: { $each: operas.filter(o => o.autoreId.valueOf == gUsers[0]._id.valueOf()) } // Aggiungi i due elementi all'array
    //      }
    //    }
    //);

    for(let i = 0; i < 3; i++){
        for(const e of gOperas.filter(o => o.autoreId.valueOf() == gUsers[i]._id.valueOf())){
            gUsers[i].opereProdotte.push(e._id);
        }
        gUsers[i] = await gUsers[i].save();    

        var payload = gUsers[i].toJSON();        
        var options = {expiresIn: 86400};
        tokens[i] = jwt.sign(payload, process.env.SUPER_SECRET, options);   
    }
}

beforeEach(async () => {
    await User.deleteMany({});
    await Opera.deleteMany({});
    await createUsers();
    await createOperas();
});

describe("POST /api/auth/", () => {
    test("POST /api/auth/ ma non vengono specificate email e password", () => {
        return request(app).post("/api/auth/").expect(400, {
            success: false,
            message: "email e/o password non specificate"
        });        
    });

    test("POST /api/auth/ ma l'email o la password è sbagliata", () => {
        return request(app).post("/api/auth/").send({
            email: "weeeeee",
            password: "woooooo"
        }).expect(403, {
            success: false,
            message: "email o password errate"
        });
    });

    test("POST /api/auth/ eseguito correttamente", async () => {
        let response = await request(app).post("/api/auth/").send({
            email: "user1@user1.com",
            password: "Password1"
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(jwt.verify(response.body.token, process.env.SUPER_SECRET)._id).toBe(response.body.user._id);        
    });
});