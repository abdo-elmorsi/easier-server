const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcryptjs");

const APIFeatures = require("../src/utils/APIFeature");

const User = require("../models/user");
const Flat = require("../models/piece");
const Tower = require("../models/tower");

const createOne = async (req, res) => {
    try {
        const newUser = new User({
            ...req.body,
        });
        await newUser.save();
        if (!newUser)
            return res.status(400).json({ message: "failed to create user!" });
        const token = newUser.generateAuthToken();
        return res.status(200).json({ user: newUser, token });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res
                .status(400)
                .json({ message: "email and password are required!" });

        const user = await User.findUser(email, password);
        if (!user)
            return res
                .status(400)
                .json({ message: "wrong email or password!" });

        const token = await user.generateAuthToken();
        return res.status(200).json({ user, token });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
const verify = async (req, res) => {
    try {
        const { _id, code } = req.body;
        if (!_id || !code)
            return res
                .status(400)
                .json({ message: "code and userId are required!" });

        const user = await User.findOne({ _id });
        if (!user)
            return res
                .status(400)
                .json({ message: "wrong code or userId!" });

        return res.status(200).json({ message: "welcome" });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
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

const updateOne = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        await user.updateOne({ ...req.body });

        return res.status(200).json({ user });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};


const deleteOne = async (req, res) => {
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
        return res.status(400).json({ message: error.message });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { user } = req;
        const { oldPassword, newPassword } = req.body;
        const passwordsMatch = await bcrypt.compare(oldPassword, user.password);
        if (!passwordsMatch) {
            return res.status(400).json({ message: "Invalid old password" });
        }
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const { user, file } = req;

        if (file && (!file?.filename || !file?.path)) {
            // If the file is missing either the filename or path property, return an error
            return res.status(400).json({ message: "Upload Image Failed" });
        }
        if (file && user.photo.public_id) {
            try {
                await cloudinary.uploader.destroy(user.photo.public_id);
            } catch (error) {
                next(error)
            }
        }
        const updateFields = {
            ...req.body,
            photo: file && {
                public_id: file.filename,
                secure_url: file.path,
            },
        };
        // Update user information in the database
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            updateFields,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res
                .status(400)
                .json({ message: "Error while updating user information" });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        return res.status(400).json({
            message: "Error updating user information",
            error: error.message,
        });
    }
};

const uploadProfilePic = async (req, res, next) => {
    try {
        const { user, file } = req;
        if (!file.filename || !file.path) {
            res.status(400).json({ message: "Upload Image Failed" });
        }
        if (user.photo.public_id) {
            try {
                await cloudinary.uploader.destroy(user.photo.public_id);
            } catch (error) {
                next(error);
            }
        }

        user.photo = {
            public_id: file.filename,
            secure_url: file.path,
        };

        await user.save();
        return res
            .status(200)
            .json({ message: "uploaded successfully", image: file.path });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

module.exports = {
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
};
