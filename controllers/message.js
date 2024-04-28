const APIFeatures = require("../src/utils/APIFeature");
const Message = require("../models/message");

const createOne = async (req, res) => {
    try {
        const { message, sender, recipient } = req.body;

        const messageCreated = await Message.create({
            message,
            sender,
            recipient,
        });

        return res.status(201).json(messageCreated);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
const getAll = async (req, res, next) => {
    try {
        const { _id: senderId } = req.user;
        const { recipient, ...query } = req.query;
        const otherUserId = recipient; 

        const extraQuery = {
            $or: [
                {
                    sender: senderId.toString(),
                    recipient: otherUserId.toString(),
                },
                {
                    sender: otherUserId.toString(),
                    recipient: senderId.toString(),
                },
            ],
        };

        // Create the main query
        const mainQuery = Message.find(extraQuery);

        // Apply API features
        const apiFeatures = new APIFeatures(mainQuery, query);
        apiFeatures.filter().sort().select().search().filters().paginate();

        // Execute the query
        const modifiedQuery = apiFeatures.getQuery();
        const items = await modifiedQuery.exec();

        // Count total items for pagination
        const totalItems = await Message.countDocuments(extraQuery);

        // Send response
        return res.status(200).json({
            items,
            currentPage: query.page || 1,
            totalPages: Math.ceil(totalItems / (query.limit || 10)),
            totalRecords: totalItems,
        });
    } catch (error) {
        next(error);
    }
};

const deleteOne = async (req, res) => {
    try {
        const message = await Message.findByIdAndDelete(req.params.id);
        if (!message) {
            return res.status(404).json({ message: "Message not found." });
        }

        return res
            .status(200)
            .json({ message: "Message deleted successfully." });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAll,
    createOne,
    deleteOne,
};
