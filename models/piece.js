const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const User = require("./user");

const AutoIncrement = require("mongoose-sequence")(mongoose);

function generateDefaultNameAndPassword() {
    return `piece-${this.floor_number}-${this.number}`;
}

const PieceSchema = new mongoose.Schema(
    {
        number: {
            type: Number,
            required: [true, "Piece number is required!"],
        },
        floor_number: {
            type: Number,
            required: [true, "Floor number is required!"],
        },
        rent_price: {
            type: Number,
            required: [true, "Rent price is required!"],
        },
        maintenance_price: {
            type: Number,
            required: [true, "Maintenance price is required!"],
        },
        user: {
            type: ObjectId,
            // required: [true, "User is required!"],
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

PieceSchema.methods.toJSON = function () {
    const piece = this.toObject();
    // delete piece.createdAt;
    delete piece.updatedAt;
    delete piece.__v;
    return piece;
};

PieceSchema.pre(/^find/, function (next) {
    this.populate({
        path: "tower",
        select: "name towerId -user",
    });
    this.populate({
        path: "user",
        select: "name userId",
    });
    next()
});

// PieceSchema.pre("save", async function (next) {
//     if (this.isNew && !this.user) {
//         try {
//             const user = new User();
//             await user.save();
//             this.user = user._id; // set the user field in the Piece document to the newly created user's _id
//             next();
//         } catch (error) {
//             next(error);
//         }
//     } else {
//         next();
//     }
// });

PieceSchema.plugin(AutoIncrement, { inc_field: "pieceId" });
const Piece = mongoose.model("Piece", PieceSchema);

module.exports = Piece;
