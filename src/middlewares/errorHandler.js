const errorHandler = (error, req, res, next) => {
    if (error) {
        // Define a default error message and status code
        let errorMessage = 'An error occurred';
        let statusCode = 400;

        // Check the type of error and customize the error response
        if (error instanceof SyntaxError && error.status === 400) {
            // Handle JSON parsing errors (e.g., invalid JSON)
            errorMessage = 'Invalid JSON data';
            statusCode = 400;
        } else if (error.name === 'ValidationError') {
            // Handle Mongoose validation errors (e.g., required fields)
            errorMessage = 'Validation error';
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
        return res.status(statusCode).json({ message: errorMessage });
    }

    // If no error is provided, proceed to the next middleware
    next();
};

module.exports = errorHandler;
