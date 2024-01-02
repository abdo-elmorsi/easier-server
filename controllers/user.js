
const APIFeatures = require("../src/utils/APIFeature");

const User = require("../models/user");
const Flat = require("../models/piece");
const Tower = require("../models/tower");

const createOne = async (req, res, next) => {
    try {
        const userId = req?.user?._id || "";
        const newUser = new User({
            ...req.body,
            ...(userId ? { admin_id: userId } : {})
        });
        // check email is already exists
        const existed_email = await User.find({ admin_id: userId, email: newUser.email });
        if (existed_email.length > 0) {
            return res.status(400).json({ message: `Email already exists. ` + newUser.email })
        }
        // check phone is already exists
        const existed_phone = await User.find({ admin_id: userId, phone_number: newUser.phone_number });
        if (existed_phone.length > 0) {
            return res.status(400).json({ message: `Phone number already exists. ` + newUser.phone_number });
        }
        // check national_id is already exists
        const existed_national_id = await User.find({ admin_id: userId, national_id: newUser.national_id });
        if (existed_national_id.length > 0) {
            return res.status(400).json({ message: `National id already exists. ` + newUser.national_id });
        }

        await newUser.save();
        if (!newUser)
            return res.status(400).json({ message: "failed to create user!" });
        const token = newUser.generateAuthToken();
        return res.status(200).json({ user: newUser, token });
    } catch (error) {
        // res.status(500).json({ error });
        next(error);
    }
};


const getProfile = async (req, res, next) => {
    try {
        const { user } = req;
        return res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const query = req.query;

        const apiFeatures = new APIFeatures(User.find(), query);
        apiFeatures.filter().sort().select().search().filters().paginate();
        const modifiedQuery = apiFeatures.getQuery();
        const items = await modifiedQuery.exec();
        const totalItems = await User.countDocuments(query);
        return res.status(200).json({
            items,
            currentPage: query.page,
            totalPages: Math.ceil(totalItems / query.limit),
            totalRecords: totalItems,
        });
    } catch (error) {
        next(error);
    }
};

const getOne = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        return res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

const updateOne = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        await user.updateOne({ ...req.body });

        return res.status(200).json({ user });
    } catch (error) {
        next(error);
    }
};


const deleteOne = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        // get all towers and there ids
        const ownedTowers = await Tower.find({ owner: user._id });
        const ownedTowerIds = ownedTowers.map((tower) => tower._id);

        // get all flats in the user towers and there ids
        const flatsToDelete = await Flat.find({
            tower: { $in: ownedTowerIds },
        });
        const flatIdsToDelete = flatsToDelete.map((flat) => flat._id);

        await User.deleteMany({ flat: { $in: flatIdsToDelete } });
        await Flat.deleteMany({ tower: { $in: ownedTowerIds } });
        await Tower.deleteMany({ owner: user._id });
        await user.remove();
        return res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
        next(error);
    }
};

// const updateProfile = async (req, res, next) => {
//     try {
//         const { user, file } = req;

//         if (file && (!file?.filename || !file?.path)) {
//             // If the file is missing either the filename or path property, return an error
//             return res.status(400).json({ message: "Upload Image Failed" });
//         }
//         if (file && user.photo.public_id) {
//             try {
//                 await cloudinary.uploader.destroy(user.photo.public_id);
//             } catch (error) {
//                 next(error)
//             }
//         }
//         const updateFields = {
//             ...req.body,
//             photo: file && {
//                 public_id: file.filename,
//                 secure_url: file.path,
//             },
//         };
//         // Update user information in the database
//         const updatedUser = await User.findByIdAndUpdate(
//             user._id,
//             updateFields,
//             { new: true, runValidators: true }
//         );

//         if (!updatedUser) {
//             return res
//                 .status(400)
//                 .json({ message: "Error while updating user information" });
//         }

//         return res.status(200).json({
//             message: "Profile updated successfully",
//             user: updatedUser,
//         });
//     } catch (error) {
//         next(error);

//     }
// };

// const uploadProfilePic = async (req, res, next) => {
//     try {
//         const { user, file } = req;
//         if (!file.filename || !file.path) {
//             res.status(400).json({ message: "Upload Image Failed" });
//         }
//         if (user.photo.public_id) {
//             try {
//                 await cloudinary.uploader.destroy(user.photo.public_id);
//             } catch (error) {
//                 next(error);
//             }
//         }

//         user.photo = {
//             public_id: file.filename,
//             secure_url: file.path,
//         };

//         await user.save();
//         return res
//             .status(200)
//             .json({ message: "uploaded successfully", image: file.path });
//     } catch (error) {
//         next(error);
//     }
// };


module.exports = {
    createOne,
    updateOne,
    getProfile,
    getAll,
    getOne,
    deleteOne,
    // updateProfile,
    // uploadProfilePic,
};


