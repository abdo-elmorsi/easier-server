const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const Flat = require("./flat");

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
        flats: [
            {
                type: ObjectId,
                ref: "Flat",
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

TowerSchema.methods.toJSON = function () {
    const tower = this.toObject();
    delete tower.owner;
    delete tower.createdAt;
    delete tower.updatedAt;
    delete tower.__v;
    return tower;
};

TowerSchema.virtual("flat", {
    ref: "Flat",
    localField: "_id", // what the local field equal here !! of curse id because we pass it as vendor
    foreignField: "tower", // field name which create the relationship
});

TowerSchema.pre("remove", async function (next) {
    await Flat.deleteMany({ tower: this._id });
    next();
});

TowerSchema.pre(/^find/, function (next) {
    this.populate({
        path: "flats",
        select: "number floorNumber rentPrice maintenancePrice",
    });
    next();
});

const Tower = mongoose.model("Tower", TowerSchema);

module.exports = Tower;
