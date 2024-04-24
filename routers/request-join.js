const router = require("express").Router();
const { auth, isSuperAdmin } = require("../src/middlewares/auth");

const {
    createOne,
    getAll,
    getOne,
    acceptRequest,
    rejectRequest,
    markAsRead,
    deleteOne,
} = require("../controllers/request-join");

router
    .route("/")
    .post(createOne)
    .get(auth, isSuperAdmin, getAll);

router
    .route("/:id")
    .get(getOne)
    .delete(auth, isSuperAdmin, deleteOne);

router.put("/:id/accept", auth, isSuperAdmin, acceptRequest);

router.put("/:id/reject", auth, isSuperAdmin, rejectRequest);

router.put("/:id/mark-as-read", auth, isSuperAdmin, markAsRead);

module.exports = router;
