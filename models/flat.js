const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const User = require("./user");

const AutoIncrement = require("mongoose-sequence")(mongoose);

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
        owner: {
            type: ObjectId,
            required: [true, "User is required!"],
            ref: "User",
        },
        tower: {
            type: ObjectId,
            required: [true, "Tower is required!"],
            ref: "Tower",
        },
    },
    {
        timestamps: true,
    }
);

FlatSchema.methods.toJSON = function () {
    const flat = this.toObject();
    delete flat.createdAt;
    delete flat.updatedAt;
    delete flat.__v;
    return flat;
};

// FlatSchema.pre("save", async function (next) {
//     if (this.isNew && !this.owner) {
//         try {
//             const user = new User();
//             await user.save();
//             this.owner = user._id; // set the user field in the Flat document to the newly created user's _id
//             next();
//         } catch (error) {
//             next(error);
//         }
//     } else {
//         next();
//     }
// });

FlatSchema.plugin(AutoIncrement, { inc_field: "flatId" });
const Flat = mongoose.model("Flat", FlatSchema);

module.exports = Flat;
