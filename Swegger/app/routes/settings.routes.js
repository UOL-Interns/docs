module.exports = app=>{
    const settings = require("../controllers/settings.controller.js");
    var router = require("express").Router();
    // Create a new Settings
    router.post("/upsertTimeSettings", settings.createTimeSettings);
    // Retrieve all Settings
    router.get("/getTimeSettings", settings.getAllTimeSettings);

    app.use('/api/settings', router);
}