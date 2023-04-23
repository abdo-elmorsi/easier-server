const router = require("express").Router();

const { uploadImage } = require("../src/middlewares/upload");
const { auth, isAdmin, isSuperAdmin } = require("../src/middlewares/auth");
const {
    createUser,
    signIn,
    getProfile,
    getAllUsers,
    deleteUser,
    updatePassword,
    updateProfile,
    uploadProfilePic,
} = require("../controllers/user");

router.post("/signIn", signIn);

router
    .route("/")
    .post(createUser)
    // .post(auth, isSuperAdmin, createUser)
    .get(auth, isSuperAdmin, getAllUsers)
    .put(auth, uploadImage, updateProfile);

router.delete("/:id", auth, isSuperAdmin, deleteUser);
router.put("/password", auth, updatePassword);
router.get("/profile", auth, isAdmin, getProfile);

// router.post("/upload", auth, uploadImage, uploadProfilePic);

module.exports = router;
