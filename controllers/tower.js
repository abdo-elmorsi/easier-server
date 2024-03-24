const APIFeatures = require("../src/utils/APIFeature");

const Piece = require("../models/piece");
const Tower = require("../models/tower");
const User = require("../models/user");

const createOne = async (req, res) => {
    try {
        const tower = new Tower({
            ...req.body,
            owner: req.body?.owner || req.user?._id,
        });

        // check name is already exists
        const existed_name = await Tower.findOne({ name: tower.name });
        if (existed_name) {
            return res.status(400).json({ message: `Name already exists. ` + tower.name });
        }


        await tower.save();
        if (!tower) {
            return res.status(400).json({ message: "failed to create tower!" });
        }

        return res.status(200).json({ tower });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};


const getAll = async (req, res, next) => {
    try {
        const query = req.query;
        // Create an instance of APIFeatures and pass in your query and queryOptions
        const apiFeatures = new APIFeatures(Tower.find(), query);

        // Chain the methods to customize your query
        apiFeatures.filter().sort().select().search().filters().paginate();

        // Get the modified query
        const modifiedQuery = apiFeatures.getQuery();

        // Execute the query
        const items = await modifiedQuery.exec();

        // You can also retrieve total records count separately, if needed
        const totalItems = await Tower.countDocuments(query);

        // Return the results
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
        const tower = await Tower.findById(req.params.id);
        if (!tower) {
            return res.status(404).json({ message: "Tower not found!" });
        }
        return res.status(200).json(tower);
    } catch (error) {
        next(error);
    }
};
const deleteOne = async (req, res) => {
    try {
        const tower = await Tower.findById(req.params.id);
        if (!tower) {
            return res.status(404).json({ message: "Tower not found!" });
        }



        // get all flats in the user towers and there ids
        const piecesToDelete = await Piece.find({ tower: tower._id }).select('_id user');
        const usersIdsToBeUpdated = piecesToDelete.map((flat) => flat.user);
        const piecesIdsToDelete = piecesToDelete.map((flat) => flat._id);


        // If the user's piece is associated with the tower being deleted, remove the piece reference from the user
        if (req.user.piece && piecesIdsToDelete.includes(req.user.piece)) {
            await req.user.updateOne({ piece: null });
        }


        // update all user related to these pieces
        const updateData = { user: null };
        await Promise.all(usersIdsToBeUpdated.map(async (userID) => {
            try {
                await User.findOneAndUpdate({ _id: userID }, updateData);
            } catch (error) {
                console.error(`Error updating user with ID ${userID}:`, error);
            }
        }));

        // Delete all pieces associated with the tower being deleted
        await Piece.deleteMany({ tower: tower._id });

        // Delete the tower itself
        await tower.remove();

        return res.status(200).json({ message: "Tower deleted successfully." });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
const updateOne = async (req, res) => {
    try {
        const tower = await Tower.findById(req.params.id);
        if (!tower) {
            return res.status(404).json({ message: "Tower not found" });
        }
        await tower.updateOne({
            ...req.body,
            owner: req.body?.owner || req.user._id,
        });

        return res.status(200).json({ tower });
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
