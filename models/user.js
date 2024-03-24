const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ObjectId } = mongoose.Schema.Types;
const AutoIncrement = require("mongoose-sequence")(mongoose);

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            lowercase: true,
            trim: true,
            required: [true, "name is required!"],
        },
        email: {
            type: String,
            lowercase: true,
            required: true,
            validate: [validator.isEmail, "Please Enter a Valid Email"],
        },
        phone_number: {
            type: String,
            trim: true,
            required: true,
            validate(value) {
                if (!validator.isMobilePhone(value)) {
                    throw new Error("Please Enter a Valid Phone Number");
                }
            },
        },
        national_id: {
            type: String,
            trim: true,
            required: false,
        },
        photo: {
            required: false,
            public_id: String,
            secure_url: String,
            default: { public_id: "", secure_url: "" },
        },
        password: {
            type: String,
            required: true,
            minlength: [8, "Password must be more than 8 chart"],
            maxlength: [20, "Password must be less than 20 chart"],
        },
        role: {
            type: String,
            enum: ["user", "admin", "superAdmin"],
            default: "user",
        },
        admin_id: {
            required: [true, "Admin id is required!"],
            type: String,
        },
        piece: {
            type: ObjectId,
            ref: "Piece",
        }
    },
    {
        timestamps: true,
        strictPopulate: false
    }
);

UserSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    // delete user.createdAt;
    // delete user.updatedAt;
    // delete user.__v;
    return user;
};

UserSchema.statics.findUser = async (email, password) => {
    const user = await User.findOne({ email });
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
//         path: "piece",
//         select: "piece_number floor_number",
//     });
//     next()
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
UserSchema.pre("updateOne", async function (next) {
    const update = this.getUpdate();
    if (update.password) {
        update.password = await bcrypt.hash(update.password, 8);
    }
    next();
});

UserSchema.plugin(AutoIncrement, { inc_field: "userId" });

const User = mongoose.model("User", UserSchema);

module.exports = User
