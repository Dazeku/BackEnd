console.log("app started");

const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../docs/swagger.json");
const authRouter = require("./routes/auth.js");
const userRouter = require("./routes/user.js");
const operaRouter = require("./routes/opera.js");
const capitoloRouter = require("./routes/capitolo.js");
const tokenChecker = require("./middlewares/tokenChecker.js");
const connect = require("./db/dbConnection.js");
const cookieParser = require("cookie-parser");
const checkEmailRouter = require("./routes/checkEmail.js");
const cors = require("cors");
const path = require("path");

require("dotenv").config({path: path.resolve(__dirname, "../config/all.env")});
require("dotenv").config({path: path.resolve(__dirname, "../secrets.env")});


async function main(){
    app=express();
    let dbUri;
    if(process.env.TESTING == "true"){
        dbUri = process.env.TESTING_DB_URI;
        console.log("connecting to testing db");        
    }else{
        dbUri = process.env.DB_URI;
        console.log("connecting to production db");
    }

    await connect(dbUri);

    //await mongoose.connect(dbUri).then(()=>{
    //    console.log("successfully connected");
    //}).catch((err)=>{
    //    console.log("error while trying to connect");
    //    throw(err);
    //});    

    
    
    /*router = require("./.....");*/
    //es: ora il valore di DB_URI contenuta
    //in all.env è accessibile in
    //process.env.DB_URI

    app.use(express.json());

    app.use(express.urlencoded({ extended: true }));

    app.use(cookieParser());
    app.use(cors());

    //not authenticated

    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.use("/api/auth", authRouter);
    app.use("/api/checkEmail", checkEmailRouter);
    

    //authenticated ... but not necessarily
    app.use(tokenChecker);

    app.use("/api/user", userRouter);
    app.use("/api/opera", operaRouter);

    app.use("/api/capitolo", capitoloRouter);
 
    /*app.use("/api", router);*/
    return app;
    
}

module.exports = main;