module.exports = app=>{
    const templates = require('../controllers/template.controller.js');
    var router = require('express').Router();

    // Create a new Templates
    router.post("/createTemplate", templates.createTemplate);
    // Retrieve all Templates
    router.get("/getAllTemplates", templates.findAllTemplates);
    // Retrieve a single Templates with title
    router.get("/getTemplateById/:id", templates.findOneTemplate);
    // Update a Templates with title
    router.put("/updateTemplateById/:id", templates.updateTemplate);
    // Delete a Templates with title
    router.post("/deleteTemplateById", templates.deleteTemplateById);
    // Delete all Templates
    router.delete("/deleteAllTemplates", templates.deleteAllTemplates);

    app.use('/api/templates', router);
}