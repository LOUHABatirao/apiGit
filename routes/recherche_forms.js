const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const dotenv = require('dotenv');
dotenv.config();
const verifyApiToken = require('../verify/verifyApiToken');


const table = `${process.env.DB_PREFIX}_recherche_forms`;

//Get all recherche_forms
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

//Get all recherche_forms by ID
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

//Add recherche_forms
router.post('/', verifyApiToken, async (req, res) => {
    try {
        knex(table)
            .insert({
                "recherche_forms_title": req.body.title,
                "recherche_forms_fields": JSON.stringify(req.body.fields),
            })
            .then(rows => {
                res.status(200).json(rows);
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }

});

//Update recherche_forms by ID
router.patch('/:id', verifyApiToken, async (req, res) => {
    try {
        knex(table)
            .where({ id: req.params.id })
            .update({
                "recherche_forms_title": req.body.title,
                "recherche_forms_fields": JSON.stringify(req.body.fields),
            })
            .then(rows => {
                res.status(200).json(rows);
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});


//Delete recherche_forms by ID
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