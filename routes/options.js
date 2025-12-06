const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const dotenv = require('dotenv');
const verifyApiToken = require('../verify/verifyApiToken');

dotenv.config();


const table = `${process.env.DB_PREFIX}_options`;

//Get all options
router.get('/', verifyApiToken, async (req, res) => {

    try {

        knex.from(table)
            .then(rows => {
                res.status(200).json(rows);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Get all options by ID
router.get('/:id', verifyApiToken, async (req, res) => {
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

//Add options
router.post('/', verifyApiToken, async (req, res) => {

    try {
        knex(table)
            .insert({
                "option_name": req.body.option_name,
                "option_value": req.body.option_value,
            })
            .then(rows => {
                res.status(200).json(rows);
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }

});

//Update options by ID
router.patch('/:id', verifyApiToken, async (req, res) => {
    try {
        knex(table)
            .where({ id: req.params.id })
            .update({
                "option_name": req.body.option_name,
                "option_value": req.body.option_value,
            })
            .then(rows => {
                res.status(200).json(rows);
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});


//Delete options by ID
router.delete('/:id', verifyApiToken, async (req, res) => {
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