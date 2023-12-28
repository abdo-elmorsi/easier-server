const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const Piece = require("./piece");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const TowerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Tower name is required!"],
        },
        address: {
            type: String,
            required: false,
        },
        number_of_floors: {
            type: Number,
            required: [true, "Number of floors is required!"],
        },
        pieces: [
            {
                type: ObjectId,
                ref: "Piece",
            },
        ],
        owner: {
            type: ObjectId,
            required: true,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

// TowerSchema.methods.toJSON = function () {
//     const tower = this.toObject();
// delete tower.owner;
// delete tower.createdAt;
//     delete tower.updatedAt;
//     delete tower.__v;
//     return tower;
// };

TowerSchema.pre(/^find/, function (next) {
    this.populate({
        path: "owner",
        select: "name userId",
    });
    next()
});

// TowerSchema.virtual("piece", {
//     ref: "Piece",
//     localField: "_id", // what the local field equal here !! of curse id because we pass it as vendor
//     foreignField: "tower", // field name which create the relationship
// });

// TowerSchema.pre("remove", async function (next) {
//     next();
// });



TowerSchema.plugin(AutoIncrement, { inc_field: "towerId" });
const Tower = mongoose.model("Tower", TowerSchema);

module.exports = Tower;
