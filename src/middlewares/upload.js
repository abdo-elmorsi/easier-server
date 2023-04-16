require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "",
        format: async (req, file) => "png",
        public_id: (req, file) => {
            const timestamp = Date.now();
            const originalName = file.originalname.replace(/\.[^/.]+$/, "");
            return `image-${originalName}-${timestamp}`;
        },
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: function (req, file, cb) {
        if (
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/png" ||
            file.mimetype === "image/jpg"
        ) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Only image files with extensions .jpg, .jpeg, .png are allowed"
                )
            );
        }
    },
});

const uploadImage = (req, res, next) => {
    upload.single("photo")(req, res, function (error) {
        if (error instanceof multer.MulterError) {
            res.status(400).json(
                "Oops, something went wrong with the file upload. Please try again."
            );
        } else if (error) {
            res.status(400).json({ message: error.message });
        } else {
            next();
        }
    });
};

module.exports = {
    uploadImage,
};
