const User = require("../models/user");
const Flat = require("../models/flat");
const Tower = require("../models/tower");

const createFlat = async (req, res) => {
    try {
        const { user } = req;
        const {
            number,
            floorNumber,
            rentPrice,
            maintenancePrice,
            tower,
            isMine,
        } = req.body;

        const foundTower = await Tower.findById(tower);
        if (!foundTower) {
            throw new Error(`Unable to find tower by ID: ${tower}`);
        }

        const flat = new Flat({
            number,
            floorNumber,
            rentPrice,
            maintenancePrice,
            tower,
            owner: user._id,
        });
        await flat.save();
        await foundTower.updateOne({ $push: { flats: flat._id } });

        // check if is not mine will create a new user and set username and pass from tower id & flat id
        if (!isMine) {
            const userNameAndPass = `user-${foundTower.towerId}-${flat.flatId}`;
            const newUser = new User({
                userName: userNameAndPass,
                password: userNameAndPass,
                admin: user._id,
                flat: flat._id,
            });
            await newUser.save();
            flat.owner = newUser._id;
            await flat.save();
        } else {
            await User.findByIdAndUpdate(user._id, {
                flat: flat._id,
            });
        }
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
        const flat = await Flat.findById(req.params.id);
        if (!flat) {
            return res.status(404).json({ message: "Flat not found!" });
        }
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

        // Remove the flat from the tower's flats array
        await Tower.findByIdAndUpdate(flat.tower, {
            $pull: { flats: flat._id },
        });

        // Remove the user associated with the flat, if the user is a tenant
        const user = await User.findById(flat.owner);
        // If the user is not a tenant, remove the flat reference from the user
        if (user.role == "tenant") {
            await user.remove();
        } else {
            await user.updateOne({ flat: null });
        }
        // Delete the flat itself

        await flat.remove();
        return res.status(200).json({ message: "Flat deleted successfully." });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const updateFlat = async (req, res) => {
    try {
        const flat = await Flat.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true, runValidators: true }
        );
        if (!flat) {
            return res.status(404).json({ message: "Flat not found!" });
        }
        return res.status(200).json({ flat });
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
