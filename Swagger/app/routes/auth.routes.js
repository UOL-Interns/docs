module.exports = app=>{
    const settings=require("../controllers/auth.controller")
    var router = require("express").Router();
    // Create a new Settings
   router.post("/sendAndCheckEmailBounceBack",settings.Authenticator)

    app.use('/api/settings', router);
}