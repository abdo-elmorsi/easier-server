const router = require("express").Router();
const { auth } = require("../src/middlewares/auth");

const { getAll, createOne, deleteOne } = require("../controllers/message");

router.route("/").post(createOne).get(auth, getAll);

router.route("/:id").delete(auth, deleteOne);

module.exports = router;
