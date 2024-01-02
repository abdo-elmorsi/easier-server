const User = require("../../models/user");
const Piece = require("../../models/piece");
const Tower = require("../../models/tower");
const Rental = require("../../models/actions/rental");

const APIFeatures = require("../../src/utils/APIFeature");

const create = async (req, res) => {
    try {
        const { tower_id, user_id, piece_id } = req.body;

        // ---------------------start validation---------------------
        const tower = await Tower.findById(tower_id);
        if (!tower) {
            throw new Error(`Unable to find tower by ID: ${tower_id}`);
        }

        const user = await User.findByIdAndUpdate(user_id, { piece: piece_id }, { new: true });
        if (!user) {
            throw new Error(`Unable to find user by ID: ${user_id}`);
        }

        const piece = await Piece.findByIdAndUpdate(piece_id, { user: user_id }, { new: true });
        if (!piece) {
            throw new Error(`Unable to find piece by ID: ${piece_id}`);
        }
        // ---------------------end validation---------------------

        const rent_record = new Rental({ ...req.body });

        await rent_record.save();

        return res.status(201).json(rent_record);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};


const getAll = async (req, res, next) => {
    try {
        const query = req.query;

        const apiFeatures = new APIFeatures(Rental.find(), query);
        apiFeatures.filter().sort().select().search().filters().paginate();
        const modifiedQuery = apiFeatures.getQuery();
        const items = await modifiedQuery.exec();
        const totalItems = await Rental.countDocuments(query);
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

module.exports = {
    create,
    getAll
};
