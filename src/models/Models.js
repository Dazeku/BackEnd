const mongoose = require("mongoose");
//const {schemaOpera, Opera} = require("./Opera.js");
const Schema = mongoose.Schema;

const schemaCapitolo = new Schema({
    titolo: String,
    operaId: {type: Schema.Types.ObjectId, ref: "Opera"},
    numero: Number,
    testo: String,
    visibile: Boolean
});

schemaCapitolo.pre('deleteOne', async function(next) {
    //console.log("in capitolo deleteOne");
    //console.log(this.getFilter());
    const doc = await this.model.findOne(this.getFilter());
    //console.log(doc);
    await Opera.updateOne({listaCap: doc._id}, {$pull: {listaCap: doc._id}});
    //console.log("out capitolo deleteOne");

    next();
});

schemaCapitolo.pre("deleteMany", async function(next) {
    //console.log("in capitolo deleteMany");
    //console.log(this.getFilter());
    const docs = await this.model.find(this.getFilter());
    //console.log(docs);
    const chptrsToDelete = docs.map(item => item._id);
    await Opera.updateMany({listaCap: {$in: chptrsToDelete}}, {$pull: {listaCap: {$in: chptrsToDelete}}});
    //console.log("out capitolo deleteMany");

    next();
});

const Capitolo = mongoose.model("Capitolo", schemaCapitolo, "capitoli");

//opere preferite è un array contenente
//gli id delle opere seguite dall'utente
const userSchema = new Schema({
    nome: String,
    cognome: String,
    username: String,
    email: String,
    password: String,
    emailChecked: Boolean,
    opereProdotte: [{type: Schema.Types.ObjectId, ref: "Opera"}],
    operePreferite: [{type: Schema.Types.ObjectId, ref: "Opera"}]
});

/*
per collegarsi a uno schema per riferimento fare:
opereProdotte: [{type: Schema.Types.ObjectId, ref: "Opera"}]
dove Opera è il nome dato al modello Opera
*/

//userSchema.pre('deleteOne', async function(next) {
//    await Opera.deleteMany({autoreId: this._id});
//    next();
//});

userSchema.pre("deleteOne", { document: false, query: true }, async function(next) {
    //console.log("in user deleteOne");
    //console.log(this.getFilter());
    const doc = await this.model.findOne(this.getFilter());
    //console.log(doc);
    await Opera.deleteMany({autoreId: doc._id});
    //console.log("out user deleteOne");

    next();
});

userSchema.pre("deleteMany", { document: false, query: true }, async function (next) { 
    //console.log("in user deleteMany");
    const docs = await this.model.find(this.getFilter()); 
    //console.log(docs);
    const users = docs.map((item) => item._id);  
    await Opera.deleteMany({autoreId: { $in: users } }); 
    //console.log("out user deleteMany");

    next(); 
});

const User = mongoose.model("User", userSchema, "users");

const schemaOpera = new Schema({
    titolo: String,
    generi: [String],
    autore: String,
    autoreId: {type: Schema.Types.ObjectId, ref: "User"},
    sinossi: String,
    nSeguaci: Number,
    listaCap: [{type: Schema.Types.ObjectId, ref: "Capitolo"}],
    visibile: Boolean
});

//schemaOpera.pre('remove', async function(next) {
//    await Capitolo.deleteMany({operaId: this._id});
//    await User.updateMany({operePreferite: this._id}, {$pull: {operePreferite: this._id}});
//    await User.updateOne({opereProdotte: this._id}, {$pull: {opereProdotte: this._id}});
//    next();
//});

schemaOpera.pre("deleteOne", { document: false, query: true }, async function(next) {
    //console.log("in opera deleteOne");
    //console.log(this.getFilter());
    const doc = await this.model.findOne(this.getFilter());
    //console.log(doc);
    await Capitolo.deleteMany({_id: { $in: doc.listaCap }});
    await User.updateMany({operePreferite: doc._id}, {$pull: {operePreferite: doc._id}});
    await User.updateOne({opereProdotte: doc._id}, {$pull: {opereProdotte: doc._id}});
    //console.log("out opera deleteOne");
    next();
});

schemaOpera.pre("deleteMany", { document: false, query: true }, async function (next) { 
    //console.log("in opera deleteMany");
    //console.log(this.getFilter());
    const docs = await this.model.find(this.getFilter()); 
    //console.log(docs);
    const chptrsToDelete = docs.map(item => item.listaCap).flat();
    const opere = docs.map((item) => item._id);  
    await Capitolo.deleteMany({_id: { $in: chptrsToDelete } }); 
    await User.updateMany({operePreferite: {$in: opere} }, {$pull: {operePreferite: {$in: opere}}});
    await User.updateOne({opereProdotte: {$in: opere}}, {$pull: {opereProdotte: {$in: opere}}});
    //console.log("out opera deleteMany");
    next(); 
});

const Opera = mongoose.model("Opera", schemaOpera, "opere");

module.exports = {
    Opera,
    schemaOpera,
    Capitolo,
    schemaCapitolo,
    User,
    userSchema
};