const {schemaOpera, Opera} = require("./Models.js");

module.exports = {schemaOpera, Opera};

//const mongoose = require("mongoose");
//const Schema = mongoose.Schema;
//const {schemaCapitolo, Capitolo}= require("./Capitolo.js");
//const User = require("./User.js");
//
//const schemaOpera = new Schema({
//    titolo: String,
//    generi: [String],
//    autore: String,
//    autoreId: {type: Schema.Types.ObjectId, ref: "User"},
//    sinossi: String,
//    nSeguaci: Number,
//    listaCap: [{type: Schema.Types.ObjectId, ref: "Capitolo"}],
//    visibile: Boolean
//});
//
////schemaOpera.pre('remove', async function(next) {
////    await Capitolo.deleteMany({operaId: this._id});
////    await User.updateMany({operePreferite: this._id}, {$pull: {operePreferite: this._id}});
////    await User.updateOne({opereProdotte: this._id}, {$pull: {opereProdotte: this._id}});
////    next();
////});
//
//schemaOpera.pre("deleteOne", { document: false, query: true }, async function(next) {
//    const doc = await this.model.findOne(this.getFilter());
//    await Capitolo.deleteMany({_id: { $in: doc.listaCap }});
//    await User.updateMany({operePreferite: doc._id}, {$pull: {operePreferite: doc._id}});
//    await User.updateOne({opereProdotte: doc._id}, {$pull: {opereProdotte: doc._id}});
//    next();
//});
//
//schemaOpera.pre("deleteMany", { document: false, query: true }, async function (next) { 
//    const docs = await this.model.find(this.getFilter()); 
//    const chptrsToDelete = docs.map(item => item.listaCap).flat();
//    const opere = docs.map((item) => item._id);  
//    await Capitolo.deleteMany({_id: { $in: chptrsToDelete } }); 
//    await User.updateMany({operePreferite: {$in: opere} }, {$pull: {operePreferite: {$in: opere}}});
//    await User.updateOne({opereProdotte: {$in: opere}}, {$pull: {opereProdotte: {$in: opere}}});
//    next(); 
//});
//
//const Opera = mongoose.model("Opera", schemaOpera, "opere");
//
//module.exports = {schemaOpera, Opera};