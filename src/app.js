require("./db/mongoose");
const errorHandler = require("./middlewares/errorHandler");
const logRequestDetails = require("./middlewares/logRequestDetails"); // Adjust the path to the middleware file

const express = require("express");
// to User hot reload
const morgan = require("morgan");
// secure my Express app
const helmet = require("helmet");
// to use .env file
const dotenv = require("dotenv");
// to ignore cors error in production
const cors = require("cors");
// to use cookies
const cookieParser = require("cookie-parser");

// routes
const DashboardRoutes = require("../routers/dashboard");
const UserRoutes = require("../routers/user");
const TowerRoutes = require("../routers/tower");
const PieceRoutes = require("../routers/piece");
const Message = require("../routers/message");

// routes / actions
const RentalRouts = require("../routers/actions/rental");
const RequestJoin = require("../routers/request-join");

const app = express();
dotenv.config();

//middleWares
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", true);
    next(); // Continue processing the request
});
app.use(logRequestDetails);

app.use(express.json());
app.use(helmet());
if (process.env.NODE_ENV === "development") {
    app.use(morgan("common"));
}
app.use(cookieParser());
app.use(
    cors({
        origin: ["http://localhost:3000", "https://easier-v1.vercel.app"],
    })
);

// routers
app.use("/api/dashboard", DashboardRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/towers", TowerRoutes);
app.use("/api/pieces", PieceRoutes);
app.use("/api/message", Message);

app.use("/api/request-join", RequestJoin);

// routers /actions
app.use("/api/actions/rental", RentalRouts);

app.get("/", async (req, res) => {
    res.send("<h1>Welcome Abdo Plz navigate to /api</h1>");
});
app.use(errorHandler);

module.exports = app;
