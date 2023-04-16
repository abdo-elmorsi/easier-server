const mongoose = require("mongoose");
const Tower = require("./tower");
const Flat = require("./flat");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ObjectId } = mongoose.Schema.Types;

const UserSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            unique: false,
            lowercase: true,
            required: [true, "Username is required!"],
        },
        email: {
            type: String,
            unique: true,
            lowercase: true,
            required: false,
            // validate(value) {
            //     if (!validator.isEmail(value)) {
            //         throw new Error("please enter a correct email");
            //     }
            // },
        },
        phoneNumber: {
            type: String,
            default: null,
            required: false,
            unique: true,
            // validate(value) {
            //     if (!validator.isMobilePhone(value, ["ar-EG"])) {
            //         throw new Error("Please Enter a Correct Phone Number");
            //     }
            // },
        },
        photo: {
            public_id: String,
            secure_url: String,
        },
        password: {
            type: String,
            required: true,
            minlength: [6, "Password must be more than 6 chart"],
        },
        role: {
            type: String,
            enum: ["tenant", "admin", "superAdmin"],
            default: "tenant",
        },
        towers: [
            {
                type: ObjectId,
                ref: "Tower",
            },
        ],
    },
    {
        timestamps: true,
    }
);

UserSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.createdAt;
    delete user.updatedAt;
    delete user.__v;
    return user;
};

UserSchema.statics.findUser = async (userName, password) => {
    const user = await User.findOne({ userName });
    if (!user) {
        throw new Error("User Doesn't Exist");
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        throw new Error("Wrong Password!. Please Confirm Password");
    }
    return user;
};

UserSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_KEY);
    return token;
};

UserSchema.pre(/^find/, function (next) {
    this.populate({
        path: "towers",
        select: "name address -flats", // select only the fields you need
    });
    next();
});

UserSchema.pre("remove", async function (next) {
    try {
        // `this` refers to the user being removed
        await Tower.deleteMany({ owner: this._id });
        await Flat.deleteMany({ tower: { $in: this.towers } });
        next();
    } catch (error) {
        next(error);
    }
});

UserSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    return next();
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
