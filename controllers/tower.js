const Flat = require("../models/flat");
const User = require("../models/user");
const Tower = require("../models/tower");

const createTower = async (req, res) => {
    try {
        const tower = new Tower({
            ...req.body,
            owner: req.user._id,
        });
        await tower.save();
        // add the tower to the user
        await req.user.updateOne({ $push: { towers: tower._id } });
        return res.status(201).json(tower);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
const getAllTowers = async (req, res) => {
    try {
        const Towers = await Tower.find({});
        return res.status(200).json({ Towers });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
const getTower = async (req, res) => {
    try {
        const tower = await Tower.findById(req.params.id);
        if (!tower) {
            return res.status(404).json({ message: "Tower not found!" });
        }
        return res.status(200).json({ tower });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
const deleteTower = async (req, res) => {
    try {
        const tower = await Tower.findById(req.params.id);
        if (!tower) {
            return res.status(404).json({ message: "Tower not found!" });
        }

        // Remove the tower from the user's towers array
        await req.user.updateOne({ $pull: { towers: tower._id } });

        const flatIdsToDelete = tower.flats;
     
        // If the user's flat is associated with the tower being deleted, remove the flat reference from the user
        if (req.user.flat && flatIdsToDelete.includes(req.user.flat)) {
            await req.user.updateOne({ flat: null });
        }

        // Delete all flats associated with the tower being deleted
        await Flat.deleteMany({ tower: tower._id });

        // Delete all users who have a flat associated with the tower being deleted
        await User.deleteMany({
            role: "tenant",
            flat: { $in: flatIdsToDelete },
        });

        // Delete the tower itself
        await tower.remove();

        return res.status(200).json({ message: "Tower deleted successfully." });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
const updateTower = async (req, res) => {
    try {
        const tower = await Tower.findById(req.params.id);
        if (!tower) {
            return res.status(404).json({ message: "Tower not found" });
        }
        await tower.updateOne({ ...req.body });

        return res.status(200).json({ tower });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createTower,
    updateTower,
    getAllTowers,
    getTower,
    deleteTower,
};
