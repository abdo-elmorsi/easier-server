function logRequestDetails(req, res, next) {
    const requestTime = new Date();
    const { method, url, headers, query, body } = req;

    // Log the request details to the console or a log file
    console.log('--------------------------------------');
    console.log('Received API request:');
    console.log('Method:', method);
    console.log('URL:', url);
    // console.log('Headers:', headers);
    console.log('Query Parameters:', query);
    console.log('Request Body:', body);
    console.log('Timestamp:', requestTime);
    console.log('--------------------------------------');

    next(); // Continue processing the request
}

module.exports = logRequestDetails;
