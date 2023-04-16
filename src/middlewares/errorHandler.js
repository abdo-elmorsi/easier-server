const errorHandler = (error, req, res, next) => {
    if (error) {
        return res.status(400).json({ message: error.message });
    }
};

module.exports = errorHandler;
