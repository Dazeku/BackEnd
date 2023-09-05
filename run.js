const appGen = require("./src/app.js");

process.env.TESTING = "false";

async function main(){
    let app = await appGen();
    app.listen(3000, ()=>{
        console.log("Listening on port 3000");
    }); 
}

main();