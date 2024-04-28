const router = require("express").Router();
const { uploadImage } = require("../src/middlewares/upload");

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
    uploadProfilePic,
} = require("../controllers/user");

router.post("/signIn", signIn);
router.post("/verify", verify);
router.route("/profile").get(auth, getProfile);
// .put(auth, updateProfile);;
router.post("/update-password", auth, updatePassword);

router.post("/forget-password", forgotPassword);
router.put("/change-password", changePassword);

router.route("/").post(auth, isAdmin, createOne).get(auth, isAdmin, getAll);

router.route("/complete-form").post(createOne);
router
    .route("/:id")
    .put(auth, isAdmin, updateOne)
    .delete(auth, isAdmin, deleteOne)
    .get(auth, getOne);

router.post("/update-profile-image", auth, uploadImage, uploadProfilePic);

module.exports = router;
