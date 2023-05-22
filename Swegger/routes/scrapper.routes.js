module.exports = app=>{
    const scrapperController=require("../controllers/scrapper.controller")
    var router = require("express").Router();
    // Create a new Settings
   router.post("/checkLead", scrapperController.checkLead)

    app.use('/api', router);
}