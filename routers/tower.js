const router = require("express").Router();
const { auth, isAdmin, isSuperAdmin } = require("../src/middlewares/auth");

const {
    createTower,
    updateTower,
    getAllTowers,
    getTower,
    deleteTower,
} = require("../controllers/tower");

// router.post("/", createTower);
// router.post("/signIn", signIn);
router
    .route("/")
    .post(auth, isAdmin, createTower)
    .get(auth, isAdmin, getAllTowers);

router
    .route("/:id")
    .put(auth, isAdmin, updateTower)
    .get(auth, isAdmin, getTower)
    .delete(auth, isAdmin, deleteTower);
// .delete(auth, deleteProfile);

module.exports = router;
