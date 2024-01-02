// models/otpModel.js
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const AutoIncrement = require("mongoose-sequence")(mongoose);

const RentalSchema = new mongoose.Schema(
    {
        user_id: {
            type: ObjectId,
            ref: "User",
            required: true,
        },
        piece_id: {
            type: ObjectId,
            ref: "Piece",
            required: true,
        },
        tower_id: {
            type: ObjectId,
            ref: "Tower",
            required: true,
        },
        rented_at: {
            type: Date,
            default: Date.now,
        },
        rent_price: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

// population logic
const populateTower = {
    path: "tower_id",
    select: "name towerId -owner",
};
const populatePiece = {
    path: "piece_id",
    select: "piece_number floor_number rent_price -user",
};
const populateUser = {
    path: "user_id",
    select: "name userId",
};

RentalSchema.pre(/^find/, function (next) {
    this.populate(populateUser);
    this.populate(populateTower)
    this.populate(populatePiece)
    next();
});

RentalSchema.plugin(AutoIncrement, { inc_field: "rental_id" });
module.exports = mongoose.model("Rental", RentalSchema);