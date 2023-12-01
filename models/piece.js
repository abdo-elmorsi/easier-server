const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const User = require("./user");
const AutoIncrement = require("mongoose-sequence")(mongoose);

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

// Removing unnecessary toJSON method as it's excluding fields you might need
// PieceSchema.methods.toJSON = function () {
//     const piece = this.toObject();
//     delete piece.updatedAt;
//     delete piece.__v;
//     return piece;
// };

PieceSchema.pre(/^find/, function (next) {
    this.populate({
        path: "tower",
        select: "name towerId -owner",
    });
    this.populate({
        path: "user",
        select: "name userId",
    });
    next()
});

PieceSchema.plugin(AutoIncrement, { inc_field: "pieceId" });

const Piece = mongoose.model("Piece", PieceSchema);

module.exports = Piece;
