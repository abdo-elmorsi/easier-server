const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

function generateDefaultUsernameAndPassword() {
    return `flat-${this.floorNumber}-${this.number}`;
}

const FlatSchema = new mongoose.Schema(
    {
        number: {
            type: Number,
            required: [true, "Flat number is required!"],
        },
        floorNumber: {
            type: Number,
            required: [true, "Floor number is required!"],
        },
        rentPrice: {
            type: Number,
            required: [true, "Rent price is required!"],
        },
        maintenancePrice: {
            type: Number,
            required: [true, "Maintenance price is required!"],
        },
        userName: {
            type: String,
            required: [true, "Username is required!"],
            default: generateDefaultUsernameAndPassword,
        },
        password: {
            type: String,
            required: true,
            minlength: [6, "Password must be more than 6 characters"],
            default: generateDefaultUsernameAndPassword,
        },
        tower: {
            type: ObjectId,
            required: true,
            ref: "Tower",
        },
    },
    {
        timestamps: true,
    }
);

FlatSchema.methods.toJSON = function () {
    const flat = this.toObject();
    delete flat.userName;
    delete flat.password;
    delete flat.createdAt;
    delete flat.updatedAt;
    delete flat.__v;
    return flat;
};


FlatSchema.pre("save", async function (next) {
    if (this.isNew) {
        this.userName = generateDefaultUsernameAndPassword.call(this);
        this.password = generateDefaultUsernameAndPassword.call(this);
    }
    next();
});

const Flat = mongoose.model("Flat", FlatSchema);

module.exports = Flat;
