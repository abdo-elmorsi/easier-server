const errorHandler = (error, req, res, next) => {
    // Check if an error is present
    if (error) {
        // Define default error message and status code
        let errorMessage = 'An error occurred';
        let statusCode = 400;

        // Handle specific error cases
        if (error instanceof SyntaxError && error.status === 400) {
            // Handle JSON parsing errors (e.g., invalid JSON)
            errorMessage = 'Invalid JSON data';
            statusCode = 400;
        } else if (error.name === 'ValidationError') {

            errorMessage = error.message;
            statusCode = 422; // Unprocessable Entity
        } else if (error.name === 'CastError' && error.kind === 'ObjectId') {
            // Handle Mongoose CastErrors (e.g., invalid ObjectId)
            errorMessage = 'Invalid ObjectId';
            statusCode = 400;
        } else {
            // Handle other unexpected errors
            errorMessage = error.message || errorMessage;
            statusCode = error.statusCode || statusCode;
        }

        // Send error response
        return res.status(statusCode).json({ message: errorMessage });
    }

    // If no error is provided, proceed to the next middleware
    next();
};

module.exports = errorHandler;