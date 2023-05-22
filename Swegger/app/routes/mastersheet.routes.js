module.exports=app=>{
    const mastersheetController=require("../controllers/mastersheet.controller");
    var router=require("express").Router();
    
    router.post("/getWholeMasterSheetWithPagination",mastersheetController.getWholeMasterSheetDataWithPagination);
    router.post("/getWholeMasterSheetWithoutPagination",mastersheetController.getWholeMasterSheetDataWithoutPagination);
    router.post("/checkBounceBack",mastersheetController.sendEmailAncCheckBounce)
    router.post("/checkDuplicateEmail", mastersheetController.checkDuplicateEmail);
    router.post("/addLeadToMasterSheet", mastersheetController.addLeadToMasterSheet);
    app.use("/api/mastersheet",router)
}