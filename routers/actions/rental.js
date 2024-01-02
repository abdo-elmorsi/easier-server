const router = require("express").Router();
const { auth, isAdmin } = require("../../src/middlewares/auth");

const {
    create,
    getAll,
} = require("../../controllers/actions/rental");

router
    .route("/")
    .post(auth, isAdmin, create)
    .get(auth, isAdmin, getAll);

module.exports = router;
