const User = require("../models/user");
const Flat = require("../models/flat");
const Tower = require("../models/tower");

const createFlat = async (req, res) => {
    try {
        const {
            number,
            floorNumber,
            rentPrice,
            maintenancePrice,
            userName,
            password,
            tower,
        } = req.body;
        const flat = new Flat({
            number,
            floorNumber,
            rentPrice,
            maintenancePrice,
            userName,
            password,
            tower,
        });
        await flat.save();
        // add the flat to thew tower
        const theTower = await Tower.findById(flat.tower);
        await theTower.updateOne({
            $push: { flats: flat._id },
        });
        return res.status(201).json(flat);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const getAllFlats = async (req, res) => {
    try {
        const flats = await Flat.find({});
        return res.status(200).json({ flats });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
const getFlat = async (req, res) => {
    try {
        const flat = await Flat.find({ _id: req.params.id });
        return res.status(200).json({ flat });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
const deleteFlat = async (req, res) => {
    try {
        const flat = await Flat.findById(req.params.id);
        if (!flat) {
            return res.status(404).json({ message: "Flat not found!" });
        }
        flat.remove();
        // delete the flat from the tower
        const tower = await Tower.findById(flat.tower);
        await tower.updateOne({ $pull: { flats: req.params.id } });

        return res.status(200).json({ message: "Flat deleted successfully." });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const updateFlat = async (req, res) => {
    try {
        const { name, email, password, phoneNumber } = req.body;
        const { _id } = req.user;

        const user = await User.findByIdAndUpdate(
            _id,
            { name, email, password, phoneNumber },
            { new: true, runValidators: true }
        );
        if (!user) {
            return res
                .status(400)
                .json({ message: "error while updating a user" });
        }

        return res.status(200).json({ user });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createFlat,
    updateFlat,
    getAllFlats,
    getFlat,
    deleteFlat,
};
