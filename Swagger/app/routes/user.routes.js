module.exports = app => {
    const users = require('../controllers/user.controller.js');
    var router = require('express').Router();
    
    router.post("/register", users.create);
    // Retrieve all Users
    router.post("/getAllUsers", users.getAllUsers);

    // token verification route for email verification 
    router.post("/verify", users.varifyEmail);
    // get verification token for email verification
    router.get("/get_verification_token/:email", users.getVerificationToken);
    // resend verification token for email verification
    // router.get("/resend_verification_token/:email", users.resendVerificationToken);

    // login route
    router.post("/login", users.login);
    // update user
    router.put("/updateUser/:id", users.update);
    // delete user
    router.delete("/deleteUser/:id", users.delete);
    // find one user
    router.post("/getUserById", users.getUserById);
    // approve account by admin
    router.post("/approveAccount", users.approveAccount);
    // reject account by admin
    router.post("/deactivateAccount", users.deactivateAccount);
    // send reset link
    router.post("/sendResetPasswordLink",users.sendResetPasswordLink)
    // Reset Password
    router.post("/resetPassword",users.resetPassword)

    app.use('/api/users', router);
}