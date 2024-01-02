const User = require("../models/user");
const Piece = require("../models/piece");
const Tower = require("../models/tower");

const APIFeatures = require("../src/utils/APIFeature");

const createOne = async (req, res) => {
    try {
        const { tower } = req.body;
        req.body.admin_id = req?.user?._id;
        const foundTower = await Tower.findById(tower);
        if (!foundTower) {
            throw new Error(`Unable to find tower by ID: ${tower}`);
        }

        const piece = new Piece({ ...req.body });

        // check apartment is already exists
        const existed_apartment = await Piece.find({ tower: piece.tower, piece_number: piece.piece_number, floor_number: piece.floor_number });
        if (existed_apartment.length > 0) {
            return res.status(400).json({ message: `apartment already exists. piece_number: ${piece.piece_number},  floor_number: ${piece.floor_number}` });
        }

        await piece.save();
        await foundTower.updateOne({ $push: { pieces: piece._id } });

        await User.findByIdAndUpdate(req.body?.user, {
            piece: piece._id,
        });
        // check if is not mine will create a new user and set name and pass from tower id & piece id
        // if (!isMine) {
        //     const nameAndPass = `user-${foundTower.towerId}-${piece.pieceId}`;
        //     const newUser = new User({
        //         name: nameAndPass,
        //         password: nameAndPass,
        //         admin: user._id,
        //         piece: piece._id,
        //     });
        //     await newUser.save();
        //     piece.user = newUser._id;
        //     await piece.save();
        // } else {
        //     await User.findByIdAndUpdate(user._id, {
        //         piece: piece._id,
        //     });
        // }
        return res.status(201).json(piece);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const getAll = async (req, res, next) => {
    try {
        const query = req.query;

        const apiFeatures = new APIFeatures(Piece.find(), query);
        apiFeatures.filter().sort().select().search().filters().paginate();
        const modifiedQuery = apiFeatures.getQuery();
        const items = await modifiedQuery.exec();
        const totalItems = await Piece.countDocuments(query);
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

const getOne = async (req, res) => {
    try {
        const piece = await Piece.findById(req.params.id).populate({ path: "tower", select: "name towerId -owner" });
        if (!piece) {
            return res.status(404).json({ message: "Piece not found!" });
        }
        return res.status(200).json(piece);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
const deleteOne = async (req, res) => {
    try {
        const piece = await Piece.findById(req.params.id);
        if (!piece) {
            return res.status(404).json({ message: "Piece not found!" });
        }

        // Remove the piece from the tower's pieces array
        await Tower.findByIdAndUpdate(piece.tower, {
            $pull: { pieces: piece._id },
        });

        // Remove the user associated with the piece, if the user is a user
        const user = await User.findById(piece.user);
        if (user) {
            user.piece = null;
            await user.save();
        }

        // Delete the piece itself

        await piece.remove();
        return res.status(200).json({ message: "Piece deleted successfully." });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const updateOne = async (req, res) => {
    try {
        const piece = await Piece.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true, runValidators: true }
        );
        if (!piece) {
            return res.status(404).json({ message: "Piece not found!" });
        }
        return res.status(200).json({ piece });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createOne,
    updateOne,
    getAll,
    getOne,
    deleteOne,
};
