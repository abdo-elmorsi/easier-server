const mongoose = require("mongoose");
const Tower = require("./tower");
const Flat = require("./flat");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ObjectId } = mongoose.Schema.Types;
const AutoIncrement = require("mongoose-sequence")(mongoose);

const UserSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            lowercase: true,
            trim: true,
            required: [true, "Username is required!"],
        },

        email: {
            type: String,
            lowercase: true,
            required: false,
            validate: [validator.isEmail, "Please Enter a Valid Email"],
        },
        phoneNumber: {
            type: String,
            trim: true,
            required: false,
            validate(value) {
                if (!validator.isMobilePhone(value, ["ar-EG"])) {
                    throw new Error("Please Enter a Valid Phone Number");
                }
            },
        },
        photo: {
            public_id: String,
            secure_url: String,
            default: { public_id: "", secure_url: "" },
        },
        password: {
            type: String,
            required: true,
            minlength: [6, "Password must be more than 6 chart"],
            maxlength: [20, "Password must be less than 20 chart"],
        },
        role: {
            type: String,
            enum: ["tenant", "admin", "superAdmin"],
            default: "tenant",
        },
        admin: {
            type: String,
        },
        flat: {
            type: ObjectId,
            ref: "Flat",
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

// UserSchema.pre(/^find/, function (next) {
//     this.populate({
//         path: "towers",
//         select: "name address -flats", // select only the fields you need
//     });
//     this.populate("flat");
//     next();
// });

// UserSchema.pre("remove", async function (next) {
//     try {
//         // `this` refers to the user being removed
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

UserSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

UserSchema.plugin(AutoIncrement, { inc_field: "userId" });

const User = mongoose.model("User", UserSchema);

module.exports = User;
