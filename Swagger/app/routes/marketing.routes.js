module.exports=app=>{
    const marketing = require("../controllers/marketing.controller.js");
    var router = require("express").Router();

    // send marketing email
    router.post("/sendMarketingEmail", marketing.sendMarketingEmail)
    app.use('/api/marketing', router);
}