const router = require("express").Router();
const { auth, isAdmin } = require("../src/middlewares/auth");

const {
    createOne,
    updateOne,
    getAll,
    getOne,
    deleteOne,
} = require("../controllers/piece");

router
    .route("/")
    .post(auth, isAdmin, createOne)
    .get(auth, isAdmin, getAll);

router
    .route("/:id")
    .put(auth, isAdmin, updateOne)
    .get(auth, getOne)
    .delete(auth, isAdmin, deleteOne);
    
module.exports = router;
