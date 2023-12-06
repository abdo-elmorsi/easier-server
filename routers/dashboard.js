const router = require("express").Router();
const { auth } = require("../src/middlewares/auth");

const {
    getTotals
} = require("../controllers/dashboard");


router.get("/count", auth, getTotals);


module.exports = router;
