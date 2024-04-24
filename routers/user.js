const router = require("express").Router();

const { auth, isAdmin } = require("../src/middlewares/auth");
const {
    signIn,
    verify,
    updatePassword,
    changePassword,
    forgotPassword,

} = require("../controllers/auth");
const {
    createOne,
    updateOne,
    getProfile,
    getAll,
    getOne,
    deleteOne,
    // updateProfile,
    // uploadProfilePic,
} = require("../controllers/user");

router.post("/signIn", signIn);
router.post("/verify", verify);
router.get("/profile", auth, getProfile);
router.put("/update-password", auth, updatePassword);


router.post("/forget-password", forgotPassword);
router.put("/change-password", changePassword);

router
    .route("/")
    .post(auth, isAdmin, createOne)
    .get(auth, isAdmin, getAll)
// .put(auth, uploadImage, updateProfile);
router
    .route("/complete-form")
    .post(createOne)
router
    .route("/:id")
    .put(auth, isAdmin, updateOne)
    .delete(auth, isAdmin, deleteOne)
    .get(auth, getOne)


// router.post("/upload", auth, uploadImage, uploadProfilePic);

module.exports = router;
