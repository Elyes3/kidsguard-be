const express = require("express")
const userController = require('../controllers/UserController')
module.exports = app => {
    var router = express.Router();

    router.post("/child/signup", userController.childSignUp);

    router.post("/parent/signup", userController.parentSignUp);

    app.use("/api/users", router);
}