require("./db/mongoose");
const errorHandler = require("./middlewares/errorHandler");

const express = require("express");
// to user hot reload
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
const UserRoutes = require("../routers/user");
const TowerRoutes = require("../routers/tower");
const FlatRouter = require("../routers/flat");

const app = express();
dotenv.config();

app.use(errorHandler);

//middleWares
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", true);
    next();
});
app.use(express.json());
app.use(helmet());
if (process.env.NODE_ENV === "development") {
    app.use(morgan("common"));
}
app.use(cookieParser());
app.use(
    cors({
        origin: ["http://localhost:3000", "https://easier-v1.vercel.app","https://b2b-dashboard-telgani-pre-dev.vercel.app"],
    })
);

// routers
app.use("/api/users", UserRoutes);
app.use("/api/towers", TowerRoutes);
app.use("/api/flats", FlatRouter);

app.get("/", async (req, res) => {
    res.send("<h1>Welcome Abdo's Plz navigate to /api</h1>");
});

module.exports = app;
