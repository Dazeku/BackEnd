const request = require("supertest");
const mongoose = require("mongoose");
const User = require("../src/models/User.js");
const Opera = require("../src/models/Opera.js").Opera;
const Capitolo = require("../src/models/Capitolo.js").Capitolo;
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

let gCapitoli = [];

async function createCapitoli(){
    let titoli = ["u1o1c1", "u1o1c2", "u1o2c1", "u1o2c2", "u2o1c1", "u2o1c2", "u2o2c1", "u2o2c2", "u3o1c1", "u3o1c2", "u3o2c1", "u3o2c2"];
    let opereIds = [gOperas[0]._id, gOperas[0]._id, gOperas[1]._id, gOperas[1]._id, gOperas[2]._id, gOperas[2]._id, gOperas[3]._id, gOperas[3]._id, gOperas[4]._id, gOperas[4]._id, gOperas[5]._id, gOperas[5]._id];
    let numeri = [1,2,1,2,1,2,1,2,1,2,1,2];
    let testi = ["testo", "testo", "testo", "testo", "testo", "testo", "testo", "testo", "testo", "testo", "testo", "testo"];
    let visibili = [true, false, true, false, true, false, true, false, true, false, true, false];
    let capitoli = [];
    for(let i = 0; i < 12; i++){
        capitoli[i] = {
            titolo: titoli[i],
            operaId: opereIds[i],
            numero: numeri[i],
            testo: testi[i],
            visibile: visibili[i]
        };
    }
    gCapitoli = await Capitolo.insertMany(capitoli);

    for(let i = 0; i < 6; i++){
        for(const e of gCapitoli.filter(c => c.operaId.valueOf() == gOperas[i]._id.valueOf())){
            gOperas[i].listaCap.push(e._id);
        }
        gOperas[i] = await gOperas[i].save();    
    }        
}

beforeEach(async () => {
    await User.deleteMany({});
    await Opera.deleteMany({});
    await Capitolo.deleteMany({});
    await createUsers();
    await createOperas();
    await createCapitoli();
});

describe("GET /api/capitolo/", () => {
    test("GET /api/capitolo/ eseguito correttamente", async () => {
        let response = await request(app).get("/api/capitolo?id="+gCapitoli[1]._id.valueOf()+"&token="+tokens[0]);
        expect(response.body.success).toBe(true);
        expect(response.body.data._id).toBe(gCapitoli[1]._id.valueOf());
    });

    test("GET /api/capitolo/ ma l'id non viene specificato", async () => {
        let response = await request(app).get("/api/capitolo/?token="+tokens[1]);
        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("non è stato specificato il parametro id");
    });

    test("GET /api/capitolo/ ma il token inviato non è valido e il capitolo ha visibilità privata", async () => {
        let response = await request(app).get("/api/capitolo/?id="+gCapitoli[1]._id.valueOf()+"&token=yeeeee");
        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("token non valido");
    });

    test("GET /api/capitolo/ ma il token inviato non è valido e l'opera ha visibilità privata", async () => {
        let response = await request(app).get("/api/capitolo/?id="+gCapitoli[2]._id.valueOf()+"&token=yeeeee");
        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("token non valido");
    });

    test("GET /api/capitolo/ ma il capitolo ha visibilità privata e non è stato fornito un token", async () => {
        let response = await request(app).get("/api/capitolo/?id="+gCapitoli[1]._id.valueOf());
        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("token non fornito, non puoi visualizzare un capitolo con visibilità privata se non sei autenticato");
    });

    test("GET /api/capitolo/ ma il capitolo ha visibilità privata e non si è autori dell'opera", async () => {
        let response = await request(app).get("/api/capitolo/?id="+gCapitoli[1]._id.valueOf()+"&token="+tokens[1]);
        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("non puoi visualizzare questo capitolo");
    });

    test("GET /api/capitolo/ ma l'opera ha visibilità privata e non è stato fornito un token", async () => {
        let response = await request(app).get("/api/capitolo/?id="+gCapitoli[2]._id.valueOf());
        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("token non fornito, non puoi visualizzare un capitolo con visibilità privata se non sei autenticato");
    });

    test("GET /api/capitolo/ ma l'opera ha visibilità privata e non se ne è l'autore", async () => {
        let response = await request(app).get("/api/capitolo/?id="+gCapitoli[2]._id.valueOf()+"&token="+tokens[1]);
        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("non puoi visualizzare questo capitolo");
    });

    test("GET /api/capitolo/ ma il capitolo non esiste", async () => {
        let response = await request(app).get("/api/capitolo/?id=111111111111");
        expect(response.statusCode).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("il capitolo non esiste");
    });

    test("GET /api/capitolo/ ma l'id del capitolo non è una stringa di 12 bytes", async () => {
        let response = await request(app).get("/api/capitolo/?id=11111111111");
        expect(response.statusCode).toBe(422);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("L'id deve essere una stringa di 12 bytes o un intero");
    });
});

describe("POST /api/capitolo/", () => {
    test("POST /api/capitolo/ richiesta eseguita correttamente", async () => {
        let response = await request(app).post('/api/capitolo/').send({
            titolo: "capitolo test",
            testo: "testo",
            id: gOperas[0]._id.valueOf(),
            token: tokens[0]
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("chapter successfully created");
    });

    test("POST /api/capitolo/ con parametri mancanti", () => {
        return request(app).post('/api/capitolo/').send({
            titolo: "capitolo test",
            id: gOperas[0]._id.valueOf(),
            token: tokens[0]
        }).expect(400, {
            success: false,
            message: "mancano uno o più parametri",
        });
    });

    test("POST /api/capitolo/ ma il token non è valido", async () => {
        let response = await request(app).post("/api/capitolo/").send({
            titolo: "capitolo test",
            testo: "testo",
            id: gOperas[0]._id.valueOf(),
            token: "wroom"
        });
        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("token non valido");
    });

    test("POST /api/capitolo/ ma non viene specificato il token", async () => {
        let response = await request(app).post("/api/capitolo/").send({
            titolo: "capitolo test",
            testo: "testo",
            id: gOperas[0]._id.valueOf()
        });
        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("token non fornito");
    });

    test("POST /api/capitolo/ con titolo già in uso", () => {
        return request(app).post('/api/capitolo/').send({
            titolo: "u1o1c1",
            testo: "testo",
            id: gOperas[0]._id.valueOf(),
            token: tokens[0]
        }).expect(403, {
            success: false,
            message: "un altro capitolo appartenente alla stessa opera ha lo stesso titolo",
        });
    });    

    test("POST /api/capitolo/ ma l'utente loggato non è autore dell'opera in cui vuole pubblicare il capitolo", () => {
        return request(app).post('/api/capitolo/').send({
            titolo: "capitolo test",
            testo: "testo",
            id: gOperas[0]._id.valueOf(),
            token: tokens[1]
        }).expect(403, {
            success: false,
            message: "non puoi pubblicare un capitolo in un'opera che non hai prodotto",
        });
    });    

    test("POST /api/capitolo/ ma l'opera in cui si vuole aggiungere il capitolo non esiste", () => {
        return request(app).post('/api/capitolo/').send({
            titolo: "capitolo test",
            testo: "testo",
            id: "111111111111",
            token: tokens[1]
        }).expect(404, {
            success: false,
            message: "L'opera specificata non esiste",
        });
    });    

    test("POST /api/capitolo/ ma l'id dell'opera non è una stringa di 12 bytes", () => {
        return request(app).post('/api/capitolo/').send({
            titolo: "capitolo test",
            testo: "testo",
            id: "11111111111",
            token: tokens[1]
        }).expect(422, {
            success: false,
            message: "L'id deve essere una stringa di 12 bytes o un intero",
        });
    });    
});

describe("PATCH /api/capitolo/", () => {
    test("PATCH /api/capitolo/ eseguita correttamente", async () => {
        let response = await request(app).patch("/api/capitolo/").send({
            id: gCapitoli[0]._id,
            titolo: "titolo originale",
            token: tokens[0]
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("modifica avvenuta con successo");
    });

    test("PATCH /api/capitolo/ ma non vengono specificati parametri da modificare", async () => {
        let response = await request(app).patch("/api/capitolo/").send({
            id: gCapitoli[0]._id,
            token: tokens[0]
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Non sono stati specificati parametri da modificare");
    });

    test("PATCH /api/capitolo/ ma non viene specificato l'id del capitolo", async () => {
        let response = await request(app).patch("/api/capitolo/").send({
            token: tokens[0]
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("id capitolo non specificato");
    });

    test("PATCH /api/capitolo/ ma il token di autenticazione non viene fornito", async () => {
        let response = await request(app).patch("/api/capitolo/").send({
            id: gCapitoli[0]._id
        });
        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("token non fornito");
    });

    test("PATCH /api/capitolo/ ma il token di autenticazione non è valido", async () => {
        let response = await request(app).patch("/api/capitolo/").send({
            id: gCapitoli[0]._id,
            token: "weeeeee"
        });
        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("token non valido");
    });

    test("PATCH /api/capitolo/ ma il titolo è già in uso", async () => {
        let response = await request(app).patch("/api/capitolo/").send({
            id: gCapitoli[0]._id,
            titolo: "u1o1c2",
            testo: "testo originale",
            token: tokens[0]
        });
        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("titolo non valido, eventuali altri dati sono stati modificati");
        let qo = await Capitolo.findOne({_id: gCapitoli[0]._id}); 
        expect(qo.titolo).toBe("u1o1c1");
        expect(qo.testo).toBe("testo originale");
    });

    test("PATCH /api/capitolo/ ma l'utente non può modificare l'opera perchè l'utente con cui è loggato non ne è l'autore", async () => {
        let response = await request(app).patch("/api/capitolo/").send({
            id: gCapitoli[0]._id,
            testo: "nuovo testo",
            token: tokens[1]
        });
        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("non puoi modificare un capitolo non tuo");
    });

    test("PATCH /api/capitolo/ ma il capitolo non esiste", async () => {
        let response = await request(app).patch("/api/capitolo/").send({
            id: "111111111111",
            titolo: "titoletto",
            token: tokens[0]
        });
        expect(response.statusCode).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("capitolo non trovato");
    });

    test("PATCH /api/capitolo/ ma l'id non è una stringa di 12 bytes", async () => {
        let response = await request(app).patch("/api/capitolo/").send({
            id: "11111111111",
            titolo: "titoletto",
            token: tokens[0]
        });
        expect(response.statusCode).toBe(422);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("L'id deve essere una stringa di 12 bytes o un intero");
    });    
});

describe("DELETE /api/capitolo/", () => {
    test("DELETE /api/capitolo/ eseguito correttamente", async () => {
        let response = await request(app).delete("/api/capitolo/").send({
            id: gCapitoli[0]._id,
            token: tokens[0]
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe("capitolo eliminato con successo");
        expect(await Capitolo.findOne({_id: gCapitoli[0]._id})).toBe(null);
    });

    test("DELETE /api/capitolo/ ma l'id non viene specificato", async () => {
        let response = await request(app).delete("/api/capitolo/").send({
            token: tokens[0]
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("id capitolo non specificato");
    });

    test("DELETE /api/capitolo/ ma non viene fornito il token", async () => {
        let response = await request(app).delete("/api/capitolo/").send({
            id: gCapitoli[0]._id
        });
        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("token non fornito");
    });

    test("DELETE /api/capitolo/ ma il token non è valido", async () => {
        let response = await request(app).delete("/api/capitolo/").send({
            id: gCapitoli[0]._id,
            token: "yaaaaa"
        });
        expect(response.statusCode).toBe(401);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("token non valido");
    });

    test("DELETE /api/capitolo/ ma l'id è di un capitolo di cui l'utente loggato non è autore", async () => {
        let response = await request(app).delete("/api/capitolo/").send({
            id: gCapitoli[0]._id,
            token: tokens[1]
        });
        expect(response.statusCode).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("non puoi eliminare un capitolo che non appartiene a una tua opera");
    });

    test("DELETE /api/capitolo/ ma il capitolo non esiste", async () => {
        let response = await request(app).delete("/api/capitolo/").send({
            id: "111111111111",
            token: tokens[0]
        });
        expect(response.statusCode).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("capitolo non trovato");
    });

    test("DELETE /api/capitolo/ ma l'id non è una stringa di 12 bytes", async () => {
        let response = await request(app).delete("/api/capitolo/").send({
            id: "11111111111",
            token: tokens[0]
        });
        expect(response.statusCode).toBe(422);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("L'id deve essere una stringa di 12 bytes o un intero");
    });
});