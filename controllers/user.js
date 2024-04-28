const APIFeatures = require("../src/utils/APIFeature");
const cloudinary = require("cloudinary").v2;

const User = require("../models/user");
const Piece = require("../models/piece");
const Tower = require("../models/tower");
const RequestJoin = require("../models/requests-join");

const createOne = async (req, res, next) => {
    try {
        const userId =
            req.user?._id || (await User.findOne({ role: "admin" }))._id;

        const newUser = new User({
            ...req.body,
            admin_id: userId,
        });

        // Check if email, phone number, or national ID already exists
        const existingUser = await User.findOne({
            admin_id: userId,
            $or: [
                { email: newUser.email },
                { phone_number: newUser.phone_number },
                { national_id: newUser.national_id },
            ],
        });

        if (existingUser) {
            if (existingUser.email === newUser.email) {
                return res.status(400).json({
                    message: `Email already exists: ${newUser.email}`,
                });
            } else if (existingUser.phone_number === newUser.phone_number) {
                return res.status(400).json({
                    message: `Phone number already exists: ${newUser.phone_number}`,
                });
            } else if (existingUser.national_id === newUser.national_id) {
                return res.status(400).json({
                    message: `National ID already exists: ${newUser.national_id}`,
                });
            }
        }

        await newUser.save();
        if (req.body?.completeUser) {
            await RequestJoin.findByIdAndDelete(req.body?.completeUser);
        }
        if (!newUser) {
            return res.status(400).json({ message: "Failed to create user!" });
        }

        const token = newUser.generateAuthToken();
        return res.status(200).json({ user: newUser, token });
    } catch (error) {
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
        const { name, email, phone_number } = req.body;

        // Check if request body contains required fields
        if (!name && !email && !phone_number) {
            return res
                .status(400)
                .json({ message: "Please provide data to update" });
        }

        // Find user by ID
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const updateFields = { name, email, phone_number };
        // Update user information in the database
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            updateFields,
            { new: true, runValidators: true }
        );

        return res.status(200).json({ user: updatedUser });
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

        // delete users under this admin
        if (user.role !== "user") {
            await User.deleteMany({ role: "user", admin_id: user._id });
            // get all towers and there ids
            const ownedTowers = await Tower.find({ owner: user._id });
            const ownedTowerIds = ownedTowers.map((tower) => tower._id);
            await Piece.deleteMany({ tower: { $in: ownedTowerIds } });
            await Tower.deleteMany({ owner: user._id });
        } else {
            // remove the user from the piece
            await Piece.findOneAndUpdate({ user: user._id }, { user: null });
        }

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

const uploadProfilePic = async (req, res, next) => {
    try {
        const { user, file } = req;

        // Check if file details are missing
        if (!file || !file.filename || !file.path) {
            return res.status(400).json({ message: "Upload Image Failed" });
        }

        // Delete previous profile picture if it exists
        if (user.photo?.public_id && user.photo?.public_id != file.filename) {
            await cloudinary.uploader.destroy(user.photo.public_id);
        }

        // Update user's profile picture details
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                photo: {
                    public_id: file.filename,
                    secure_url: file.path,
                },
            },
            { new: true, runValidators: true }
        );

        // Return success response
        return res.status(200).json(updatedUser);
    } catch (error) {
        // Pass error to the error handling middleware
        next(error);
    }
};

module.exports = {
    createOne,
    updateOne,
    getProfile,
    getAll,
    getOne,
    deleteOne,
    // updateProfile,
    uploadProfilePic,
};
