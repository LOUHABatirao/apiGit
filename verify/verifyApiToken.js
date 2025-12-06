
const jwt = require('jsonwebtoken');
const knex = require('../db/knex');  
const table_authorized_apps = `${process.env.DB_PREFIX}_authorized_apps`;

module.exports = (req, res, next) => {
    const ApiToken = req.header('api-token');
    if (!ApiToken) return res.status(401).send('Access Denied');
    try {
        const verified = jwt.verify(ApiToken, process.env.TOKEN_SECRET);
        knex.from(table_authorized_apps)
            .whereNull('deleted_at')
            .where('host', verified.host)
            .then(apps => {
                if (apps.length) {
                    if (apps[0].is_allowed) {
                        next();
                    }else{
                        res.status(401).send('Access Denied');
                    }
                }
            }).catch(err=>{
                res.status(401).send('Access Denied');
            });
    } catch (error) {
        res.status(401).send('Access Denied');
    }

}