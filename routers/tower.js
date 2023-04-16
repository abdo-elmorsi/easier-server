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
    .get(auth, isAdmin, getAllTowers)
    .put(auth, isAdmin, updateTower);
router.route("/:id").get(auth, isAdmin, getTower);
router.route("/:id").delete(auth, isAdmin, deleteTower);
// .delete(auth, deleteProfile);

module.exports = router;
