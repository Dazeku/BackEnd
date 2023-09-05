const {User} = require("./Models.js");

module.exports = User;

//const mongoose = require("mongoose");
//const Schema = mongoose.Schema;
//const {schemaOpera, Opera} = require("./Opera.js");
//
////opere preferite è un array contenente
////gli id delle opere seguite dall'utente
//const userSchema = new Schema({
//    nome: String,
//    cognome: String,
//    username: String,
//    email: String,
//    password: String,
//    opereProdotte: [{type: Schema.Types.ObjectId, ref: "Opera"}],
//    operePreferite: [{type: Schema.Types.ObjectId, ref: "Opera"}]
//});
//
///*
//per collegarsi a uno schema per riferimento fare:
//opereProdotte: [{type: Schema.Types.ObjectId, ref: "Opera"}]
//dove Opera è il nome dato al modello Opera
//*/
//
////userSchema.pre('deleteOne', async function(next) {
////    await Opera.deleteMany({autoreId: this._id});
////    next();
////});
//
//userSchema.pre("deleteOne", { document: false, query: true }, async function(next) {
//    const doc = await this.model.findOne(this.getFilter());
//    await Opera.deleteMany({autoreId: doc._id});
//    next();
//});
//
//userSchema.pre("deleteMany", { document: false, query: true }, async function (next) { 
//    const docs = await this.model.find(this.getFilter()); 
//    const users = docs.map((item) => item._id);  
//    await Opera.deleteMany({autoreId: { $in: users } }); 
//    next(); 
//});
//
//const User = mongoose.model("User", userSchema, "users");
//
//module.exports = User;