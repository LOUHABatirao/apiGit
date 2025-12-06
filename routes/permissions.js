const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const dotenv = require('dotenv');
dotenv.config();

const verifyAuthToken = require('../verify/verifyToken');
const verifyApiToken = require('../verify/verifyApiToken');

const table = `${process.env.DB_PREFIX}_permissions`;

//Get all permissions
router.get('/', verifyAuthToken, verifyApiToken, async (req, res) => {

    try {

        knex.from(table)
            .then(rows => {
                res.status(200).json(rows);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Get all permissions by ID
router.get('/:id', verifyAuthToken, verifyApiToken, async (req, res) => {
    try {

        knex.from(table)
            .where({ id: req.params.id })
            .then(rows => {
                res.status(200).json(rows);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Add permissions
router.post('/', verifyAuthToken, verifyApiToken, async (req, res) => {
    const { name, key, create, update, del, show } = req.body;
    try {
        knex(table)
            .insert({
                "permissions_name": name,
                "key": key,
                "create": create,
                "delete": del,
                "update": update,
                "show": show,
            })
            .then(rows => {
                res.status(200).json(rows);
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }

});

//Update permissions by ID
router.patch('/:id', verifyAuthToken, verifyApiToken, async (req, res) => {
    const { name, key, create, update, del, show } = req.body;

    try {
        knex(table)
            .where({ id: req.params.id })
            .update({
                "permissions_name": name,
                "key": key,
                "create": create,
                "delete": del,
                "update": update,
                "show": show,
                "updated_at": knex.fn.now()
            })
            .then(rows => {
                res.status(200).json(rows);
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});


//Delete permissions by ID
router.delete('/:id', verifyAuthToken, verifyApiToken, async (req, res) => {
    try {
        knex(table)
            .where({ id: req.params.id })
            .del()
            .then(rows => {
                res.status(200).json(rows);
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

module.exports = router;