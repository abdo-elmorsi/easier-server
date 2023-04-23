const router = require("express").Router();
const { auth, isAdmin, isSuperAdmin } = require("../src/middlewares/auth");

const {
    createFlat,
    updateFlat,
    getAllFlats,
    getFlat,
    deleteFlat,
} = require("../controllers/flat");

// router.post("/", createFlat);
// router.post("/signIn", signIn);
router
    .route("/")
    .post(auth, isAdmin, createFlat)
    .get(auth, isAdmin, getAllFlats);

router.route("/:id").get(auth, isAdmin, getFlat);
router.route("/:id").delete(auth, isAdmin, deleteFlat);

router
    .route("/:id")
    .put(auth, isAdmin, updateFlat)
    .get(auth, isAdmin, getFlat)
    .delete(auth, isAdmin, deleteFlat);
// .delete(auth, deleteProfile);

module.exports = router;
