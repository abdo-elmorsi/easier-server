const router = require("express").Router();

const { uploadImage } = require("../src/middlewares/upload");
const { auth, isAdmin, isSuperAdmin, tempAuth } = require("../src/middlewares/auth");
const {
    createOne,
    updateOne,
    signIn,
    verify,
    getProfile,
    getAll,
    getOne,
    deleteOne,
    updatePassword,
    updateProfile,
    uploadProfilePic,
} = require("../controllers/user");

router.post("/signIn", signIn);
router.post("/verify", verify);
router.get("/profile", auth, getProfile);
router.put("/password", auth, updatePassword);

router
    .route("/")
    .post(auth, isAdmin, createOne)
    .get(auth, isAdmin, getAll)
// .put(auth, uploadImage, updateProfile);

router
    .route("/:id")
    .put(auth, isAdmin, updateOne)
    .delete(auth, isAdmin, deleteOne)
    .get(auth, getOne)


// router.post("/upload", auth, uploadImage, uploadProfilePic);

module.exports = router;
