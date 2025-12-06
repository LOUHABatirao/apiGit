const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const dotenv = require('dotenv');
dotenv.config();
const verifyApiToken = require('../verify/verifyApiToken');


const table = `${process.env.DB_PREFIX}_menus`;

//Get all menus
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

//Get all menus by ID
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

//Add menus
router.post('/', verifyApiToken, async (req, res) => {

    try {
        knex(table)
            .insert({
                "menus_title": req.body.menus_title,
            })
            .then(rows => {
                res.status(200).json(rows);
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }

});

//Update menus by ID
router.patch('/:id', verifyApiToken, async (req, res) => {
    try {
        knex(table)
            .where({ id: req.params.id })
            .update({
                "menus_title": req.body.menus_title,
                "updated_at": knex.fn.now()
            })
            .then(rows => {
                res.status(200).json(rows);
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});


//Delete menus by ID
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