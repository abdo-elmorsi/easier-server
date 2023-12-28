const paginateAndSearch = async (model, query, req, searchFields = ["name"]) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let searchQuery = {};

        if (req.query.search) {
            const searchTerms = req.query.search.split(" ");

            const regexPatterns = searchTerms.map((term) => {
                return new RegExp(term, "i");
            });

            searchQuery = {
                $or: searchFields.map((field) => ({
                    [field]: { $in: regexPatterns },
                })),
            };
        }

        const fullQuery = { ...query, ...searchQuery };

        const itemsPromise = model
            .find(fullQuery)
            .skip(skip)
            .limit(limit);

        const totalItemsPromise = model.countDocuments(fullQuery);

        const [items, totalItems] = await Promise.all([itemsPromise, totalItemsPromise]);

        const totalPages = Math.ceil(totalItems / limit);

        return {
            items,
            currentPage: page,
            totalPages,
            totalItems,
        };
    } catch (error) {
        throw error;
    }
};


const generateOtp = () => {
    const otpCode = Math.floor(Math.random() * 9000 + 1000); // Generate a 4-digit OTP
    return otpCode
}
module.exports = {
    paginateAndSearch,
    generateOtp
};