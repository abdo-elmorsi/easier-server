const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const User = require("./user");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const PieceSchema = new mongoose.Schema(
    {
        piece_number: {
            type: String,
            required: [true, "Piece number is required!"],
        },
        floor_number: {
            type: String,
            required: [true, "Floor number is required!"],
        },
        rent_price: {
            type: Number,
            required: [true, "Rent price is required!"],
            min: 0,
        },
        maintenance_price: {
            type: Number,
            required: [true, "Maintenance price is required!"],
            min: 0,
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
        admin_id: {
            required: [true, "Admin id is required!"],
            type: String,
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


// population logic
const populateTower = { path: "tower", select: "name towerId -owner" };
const populateUser = { path: "user", select: "name userId" };

PieceSchema.pre(/^find/, function (next) {
    this.populate(populateTower).populate(populateUser);
    next();
});


PieceSchema.plugin(AutoIncrement, { inc_field: "pieceId" });

const Piece = mongoose.model("Piece", PieceSchema);

module.exports = Piece;
