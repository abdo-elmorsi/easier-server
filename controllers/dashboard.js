const moment = require('moment');
const User = require("../models/user");
const Piece = require("../models/piece");
const Tower = require("../models/tower");

const getTotals = async (req, res, next) => {
    try {
        const { from, to } = req.query;

        let fromDate = from ? moment(from) : moment().subtract(1, 'week');
        let toDate = to ? moment(to) : moment();

        const userId = req.user._id;
        fromDate = fromDate.startOf('day');
        toDate = toDate.endOf('day');

        const isAdmin = (filter) => req?.user?.role != "superAdmin" ? filter : {};
        const usersPrev = await User.countDocuments({
            createdAt: { $lte: fromDate },
            ...(isAdmin({ admin_id: userId })),

        });
        const currentUsers = await User.countDocuments({
            createdAt: { $lte: toDate },
            ...(isAdmin({ admin_id: userId })),

        });

        const piecesPrev = await Piece.countDocuments({
            createdAt: { $lte: fromDate },
            ...(isAdmin({ admin_id: userId }))
        });

        const currentPieces = await Piece.countDocuments({
            createdAt: { $lte: toDate },
            ...(isAdmin({ admin_id: userId }))
        });

        const towersPrev = await Tower.countDocuments({
            createdAt: { $lte: fromDate },
            ...(isAdmin({ owner: userId }))
        });

        const currentTowers = await Tower.countDocuments({
            createdAt: { $lte: toDate },
            ...(isAdmin({ owner: userId }))
        });

        const formattedData = {
            users: {
                prev: usersPrev,
                current: currentUsers,
            },
            pieces: {
                prev: piecesPrev,
                current: currentPieces,
            },
            towers: {
                prev: towersPrev,
                current: currentTowers,
            },
            fromDate: fromDate.format('YYYY-MM-DD HH:mm:ss'), // Format the fromDate for readability
            toDate: toDate.format('YYYY-MM-DD HH:mm:ss'), // Format the toDate for readability
        };

        res.json(formattedData);
    } catch (error) {
        console.error('Error in getTotals:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getTotals,
};
