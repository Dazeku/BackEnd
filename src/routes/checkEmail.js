const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const checkEmail = require("../controllers/checkEmail.js");
require("dotenv").config();

router.get("/", async function(req, res){
    let mctoken = req.query.mctoken;
    checkEmail(mctoken, req, res);
});

module.exports = router;