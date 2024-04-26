const Users = require("../../models/user");
const jwt = require("jsonwebtoken");

// Middleware function to authenticate User.

const auth = async (req, res, next) => {
    try {
        // Get the token from the request headers
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ message: "Token not provided" });
        }

        // Verify the token using your JWT secret key
        const decoded = jwt.verify(token, process.env.JWT_KEY);

        // Find the user in your database based on the decoded token
        const user = await Users.findById(decoded._id);

        if (!user) {
            return res.status(401).json({ message: "User with this token not found" });
        }

        // Attach the user to the request for future use
        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: "Authentication failed" });
    }
};
const tempAuth = async (req, res, next) => {
    try {
        let userId = req.body.user_id;

        // Find the user in your database based on the decoded token
        const user = await Users.findById(userId);

        if (!user) {
            return res.status(401).json({ message: "User with this token not found" });
        }

        // Attach the user to the request for future use
        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: "Authentication failed" });
    }
};

const checkRole = (role) => async (req, res, next) => {
    try {
        const { user } = req;
        if (user.role !== role && user.role !== "superAdmin") {
            return res
                .status(401)
                .json({ message: `Only ${role}s can perform this action` });
        }
        next();
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const isAdmin = checkRole("admin");
const isSuperAdmin = checkRole("superAdmin");

module.exports = {
    auth,
    tempAuth,
    isAdmin,
    isSuperAdmin,
};
