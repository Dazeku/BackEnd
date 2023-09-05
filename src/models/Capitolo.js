const {schemaCapitolo, Capitolo} = require("./Models.js");

module.exports = {schemaCapitolo, Capitolo};

//const mongoose = require("mongoose");
////const {schemaOpera, Opera} = require("./Opera.js");
//const Schema = mongoose.Schema;
//
//const schemaCapitolo = new Schema({
//    titolo: String,
//    operaId: {type: Schema.Types.ObjectId, ref: "Opera"},
//    numero: Number,
//    testo: String,
//    visibile: Boolean
//});
//
//schemaCapitolo.pre('deleteOne', async function(next) {
//    const {schemaOpera, Opera} = require("./Opera.js");
//    const doc = await this.model.findOne(this.getFilter());
//    await Opera.updateOne({listaCap: doc._id}, {$pull: {listaCap: doc._id}});
//    
//    next();
//});
//
//schemaCapitolo.pre("deleteMany", async function(next) {
//    const {schemaOpera, Opera} = require("./Opera.js");
//    const docs = await this.model.find(this.getFilter());
//    const chptrsToDelete = docs.map(item => item._id);
//    await Opera.updateMany({listaCap: {$in: chptrsToDelete}}, {$pull: {listaCap: {$in: chptrsToDelete}}});
//
//    next();
//});
//
//const Capitolo = mongoose.model("Capitolo", schemaCapitolo, "capitoli");
//
//module.exports = {schemaCapitolo, Capitolo};