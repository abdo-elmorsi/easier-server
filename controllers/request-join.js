const { mailSender, generateCompleteUserInfoEmailTemplate } = require('../src/utils/mailSender');
const APIFeatures = require("../src/utils/APIFeature");
const RequestJoin = require("../models/requests-join");
const { default: mongoose } = require('mongoose');

// Define a function to send emails with error handling
async function sendCompleteUserInfoEmail(user, link, accept) {
    try {
        const body = generateCompleteUserInfoEmailTemplate(link, user.user_name, accept);
        await mailSender(
            user.user_email,
            accept ? "Complete User Information" : "Reject request",
            body
        );
    } catch (error) {
        throw error; // Propagate the error for centralized error handling
    }
}

const createOne = async (req, res) => {
    try {
        const { user_name, user_email, user_phone_number } = req.body;
        // Check if user request already exists
        const existingRequest = await RequestJoin.findOne({ user_email });
        if (existingRequest) {
            return res.status(400).json({ message: `You already have a request. Request ID: ${existingRequest._id}` });
        }

        // Validate request body fields
        if (!user_name || !user_email || !user_phone_number) {
            return res.status(400).json({ message: "Please provide user name, email, and phone number." });
        }

        const request = await RequestJoin.create({ user_name, user_email, user_phone_number });

        return res.status(201).json({ message: `We will send a verification link to your email address (${user_email}). Please check your inbox soon.`, request });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getAll = async (req, res, next) => {
    try {
        const query = req.query;

        const apiFeatures = new APIFeatures(RequestJoin.find(), query);
        apiFeatures.filter().sort().select().search().filters().paginate();
        const modifiedQuery = apiFeatures.getQuery();
        const items = await modifiedQuery.exec();
        const totalItems = await RequestJoin.countDocuments(query);
        return res.status(200).json({
            items,
            currentPage: query.page,
            totalPages: Math.ceil(totalItems / (query.limit || 10)),
            totalRecords: totalItems,
        });
    } catch (error) {
        next(error);
    }
};


const getOne = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params?.id)) {
            throw new Error("Invalid Request ID format.");
        }
        const request = await RequestJoin.findById(req.params?.id || "");
        if (!request) {
            return res.status(404).json({ message: "request not found!" });
        }
        return res.status(200).json(request);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const deleteOne = async (req, res) => {
    try {
        const request = await RequestJoin.findByIdAndDelete(req.params.id);
        if (!request) {
            return res.status(404).json({ message: "Request not found." });
        }

        return res.status(200).json({ message: "Request deleted successfully." });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const acceptRequest = async (req, res) => {
    const { link } = req.body;

    try {
        const request = await RequestJoin.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: "Request not found." });
        }

        request.email_sent = true;
        await request.save();

        // Send rejection email to the user
        const user = { user_name: request.user_name, user_email: request.user_email };

        await sendCompleteUserInfoEmail(user, `${link}?requestid=${request?._id}`, true);


        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const rejectRequest = async (req, res) => {
    try {
        const request = await RequestJoin.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: "Request not found." });
        }

        await sendCompleteUserInfoEmail({ user_name: request.user_name, user_email: request.user_email }, null, false);

        await request.remove();

        return res.status(200).json({ message: "Request deleted successfully." });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const request = await RequestJoin.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: "Request not found." });
        }

        request.seen_by = true;
        await request.save();

        return res.status(200).json({ message: "request read successfully" });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createOne,
    getAll,
    getOne,
    acceptRequest,
    rejectRequest,
    markAsRead,
    deleteOne,
};
