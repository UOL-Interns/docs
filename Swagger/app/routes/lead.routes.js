module.exports = app=>{
    const leads = require('../controllers/lead.controller.js');
    var router = require('express').Router();

    // Create a new Lead
    // router.post("/sendEmail", leads.sendEmail);
    // check duplicate email


    // Create a new Lead
    router.post("/createLead", leads.createLead);
    router.post("/deleteLead", leads.deleteLead);
    // get all leads with pagination
    router.post("/getAllLeads", leads.getAllLeads);
    // get All leads by userId
    router.post("/getAllLeadsByUserId", leads.getAllLeadsByUserId);
    router.post("/getAllBDLeadsByUserId", leads.getAllBDLeadsByUserId);
    // // get all leads without pagination for excel sheet download 
    // router.get("/getAllLeadsForExcel", leads.getAllLeadsForExcel);
    // get lead by id
    router.get("/getLeadById/:id", leads.getLeadById);
    // get lead by email
    router.get("/getLeadByEmail/:email", leads.getLeadByEmail);

    // update lead
    router.post("/updateLead", leads.updateLead);
    // perhour lead count
    // generate leads team report
    router.post('/generateReport',leads.generateReport)
    // generate single User report
    router.post('/generateUserReport',leads.generateUserReport)
    app.use('/api/leadManagement', router);
}