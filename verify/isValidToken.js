const jwt = require('jsonwebtoken');

module.exports = (token) => {
    if (!token) return res.status(401).send('Access Denied'); 
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        res.status(200).send({
            isValide : true,
            token: verified,
            error : null
        });
    } catch (error) {
        res.status(400).send({
            isValide: true,
            token: null,
            error: error
        });
    }

}