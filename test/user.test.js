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


describe("POST /api/user/signup", () => {
    test("POST /api/user/signup richiesta eseguita correttamente", () => {
        return request(app).post('/api/user/signup').send({
            username: "user4",
            email: "user4@user4.com",
            password: "Password4",
            nome: "user4",
            cognome: "user4"
        }).expect(200, {
            success: true,
            message: "registrazione avvenuta",
        });
    });

    test("POST /api/user/signup con parametri mancanti", () => {
        return request(app).post('/api/user/signup').send({
            username: "user4",
            email: "user4@user4.com",
            password: "Password4",
            nome: "user4"
        }).expect(400, {
            success: false,
            message: "parametri mancanti",
        });
    });

    test("POST /api/user/signup con username già in uso", () => {
        return request(app).post('/api/user/signup').send({
            username: "user2",
            email: "user4@user4.com",
            password: "Password4",
            nome: "user4",
            cognome: "user4"
        }).expect(403, {
            success: false,
            message: "username o email già in uso",
        });
    });

    test("POST /api/user/signup con email già in uso", () => {
        return request(app).post('/api/user/signup').send({
            username: "user4",
            email: "user2@user2.com",
            password: "Password4",
            nome: "user4",
            cognome: "user4"
        }).expect(403, {
            success: false,
            message: "username o email già in uso",
        });
    });

    test("POST /api/user/signup con email non valida", () => {
        return request(app).post('/api/user/signup').send({
            username: "user4",
            email: "australopiteco",
            password: "Password4",
            nome: "user4",
            cognome: "user4"
        }).expect(403, {
            success: false,
            message: "email non valida",
        });
    });

    test("POST /api/user/signup con password che non rispetta i requisiti di sicurezza", () => {
        return request(app).post('/api/user/signup').send({
            username: "user4",
            email: "user4@user4.com",
            password: "password4",
            nome: "user4",
            cognome: "user4"
        }).expect(403, {
            success: false,
            message: "la password non rispetta i requisiti di sicurezza",
        });
    });
});

describe("GET /api/user/getmany", () => {
    test("GET /api/user/getmany con parametro username non specificato", () => {
        return request(app).get("/api/user/getmany").expect(400, {
            success: false,
            message: "query error"
        });
    });

    test("GET /api/user/getmany con parametro username specificato", async () => {
        let response = await request(app).get("/api/user/getmany?username=3");
        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data[0]._id).toBe(gUsers[2]._id.valueOf());
    });
});

describe("GET /api/user/", () => {
    test("GET /api/user/ usando un id esistente da non autenticato", async () => {
        let response = await request(app).get("/api/user/?id="+gUsers[0]._id.valueOf());
        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data._id).toBe(gUsers[0]._id.valueOf());
    });

    test("GET /api/user/ ma l'id non viene specificato", async () => {
        let response = await request(app).get("/api/user/");
        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("query error");
    });

    test("GET /api/user/ ma l'utente avente l'id specificato non esiste", async () => {
        let response = await request(app).get("/api/user/?id=111111111111");
        expect(response.statusCode).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("l'utente non esiste");
    });

    test("GET /api/user/ ma l'id non è una stringa di 12 bytes", async () => {
        let response = await request(app).get("/api/user/?id=11111111111");
        expect(response.statusCode).toBe(422);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("L'id deve essere una stringa di 12 bytes o un intero");
    });
});

describe("PATCH /api/user/", () => {
    test("PATCH /api/user/ ma non vengono specificati parametri da modificare", async () => {
        let response = await request(app).patch("/api/user/").send({token: tokens[0]});
        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Non sono stati specificati parametri da modificare");
    });

    test("PATCH /api/user/ ma il token di autenticazione non viene fornito", async () => {
        let response = await request(app).patch("/api/user/").send({
            nome: "armadillo"
        });
        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("token non fornito");
    });

    test("PATCH /api/user/ ma il token di autenticazione non è valido", async () => {
        let response = await request(app).patch("/api/user/").send({
            nome: "armadillo",
            token: "weeeeee"
        });
        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("token non valido");
    });

    test("PATCH /api/user/ ma lo username è già in uso", async () => {
        let response = await request(app).patch("/api/user/").send({
            username: "user2",
            token: tokens[0]
        });
        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("username non valido, eventuali altri dati sono stati modificati");
    });

    test("PATCH /api/user/ eseguita correttamente", async () => {
        let response = await request(app).patch("/api/user/").send({
            nome: "arlecchino",
            token: tokens[0]
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("modifica avvenuta con successo");
    });
});

describe("POST /api/user/addPref", () => {
    test("POST /api/user/addPref ma non viene specificato l'id dell'opera", async () => {
        let response = await request(app).post("/api/user/addPref").send({
            token: tokens[0]
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("id opera non fornito");
    });

    test("POST /api/user/addPref ma il token non è valido", async () => {
        let response = await request(app).post("/api/user/addPref").send({
            id: gOperas[2]._id.valueOf(),
            token: "yeeeee"
        });
        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("token non valido");
    });

    test("POST /api/user/addPref ma non viene specificato il token", async () => {
        let response = await request(app).post("/api/user/addPref").send({
            id: gOperas[2]._id.valueOf()
        });
        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("token non fornito");
    });

    test("POST /api/user/addPref ma l'opera ha visibilità privata", async () => {
        let response = await request(app).post("/api/user/addPref").send({
            token: tokens[0],
            id: gOperas[3]._id.valueOf()
        });
        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("non puoi seguire quest'opera");
    });

    test("POST /api/user/addPref ma l'opera non esiste", async () => {
        let response = await request(app).post("/api/user/addPref").send({
            token: tokens[0],
            id: "222222222222"
        });
        expect(response.statusCode).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("l'opera non esiste");
    });

    test("POST /api/user/addPref ma l'id dell'opera non è di 12 bytes", async () => {
        let response = await request(app).post("/api/user/addPref").send({
            token: tokens[0],
            id: "22222222222"
        });
        expect(response.statusCode).toBe(422);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("L'id deve essere una stringa di 12 bytes o un intero");
    });

    test("POST /api/user/addPref eseguito correttamente", async () => {
        let response = await request(app).post("/api/user/addPref").send({
            token: tokens[0],
            id: gOperas[2]._id.valueOf()
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("operazione avvenuta con successo");
        expect((await User.findOne({_id: gUsers[0]._id})).operePreferite[0]._id.valueOf()).toBe(gOperas[2]._id.valueOf());
    });    
});

describe("POST /api/user/remPref", () => {
    test("POST /api/user/remPref ma non viene specificato l'id dell'opera", async () => {
        let response = await request(app).post("/api/user/remPref").send({
            token: tokens[0]
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("id opera non fornito");
    });

    test("POST /api/user/remPref ma il token non è valido", async () => {
        let response = await request(app).post("/api/user/remPref").send({
            id: gOperas[2]._id.valueOf(),
            token: "yeeeee"
        });
        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("token non valido");
    });

    test("POST /api/user/remPref ma non viene specificato il token", async () => {
        let response = await request(app).post("/api/user/remPref").send({
            id: gOperas[2]._id.valueOf()
        });
        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("token non fornito");
    });

    test("POST /api/user/remPref ma l'opera non esiste", async () => {
        let response = await request(app).post("/api/user/remPref").send({
            token: tokens[0],
            id: "222222222222"
        });
        expect(response.statusCode).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("l'opera non esiste");
    });

    test("POST /api/user/remPref ma l'id dell'opera non è di 12 bytes", async () => {
        let response = await request(app).post("/api/user/remPref").send({
            token: tokens[0],
            id: "22222222222"
        });
        expect(response.statusCode).toBe(422);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("L'id deve essere una stringa di 12 bytes o un intero");
    });

    test("POST /api/user/remPref eseguito correttamente ma l'opera non è tra le preferite dell'utente", async () => {
        let response = await request(app).post("/api/user/remPref").send({
            token: tokens[0],
            id: gOperas[2]._id.valueOf()
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("l'opera non era tra le opere seguite");
    });
    
    test("POST /api/user/remPref eseguito correttamente e l'opera era tra le preferite dell'utente", async () => {
        await request(app).post("/api/user/addPref").send({
            token: tokens[0],
            id: gOperas[2]._id.valueOf()
        });
        
        let response = await request(app).post("/api/user/remPref").send({
            token: tokens[0],
            id: gOperas[2]._id.valueOf()
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("l'opera è stata rimossa dalle opere che segui");
        expect((await User.findOne({_id: gUsers[0]._id})).operePreferite.length).toBe(0);
    });
});

describe("DELETE /api/user/", () => {
    test("DELETE /api/user/ ma non viene fornito il token", async () => {
        let response = await request(app).delete("/api/user/");
        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("token non fornito");
    });

    test("DELETE /api/user/ ma il token non è valido", async () => {
        let response = await request(app).delete("/api/user/").send({
            token: "yaaaaa"
        });
        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("token non valido");
    });

    test("DELETE /api/user/ eseguito correttamente", async () => {
        let response = await request(app).delete("/api/user/").send({
            token: tokens[0]
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("utente eliminato con successo");
        expect((await User.findOne({_id: gUsers[0]._id}))).toBe(null);
    });
});



