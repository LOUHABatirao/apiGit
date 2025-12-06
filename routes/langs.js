const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const dotenv = require('dotenv');
const { createValidation } = require('../validation/langs')
const verifyApiToken = require('../verify/verifyApiToken');

dotenv.config();


const table = `${process.env.DB_PREFIX}_langs`;

//Get all langs
router.get('/', verifyApiToken, async (req, res) => {

    try {

        knex.from(table)
            .whereNull('deleted_at')
            .then(rows => {
                res.status(200).json(rows);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Get trashed  langs
router.get('/trashed', verifyApiToken, async (req, res) => {

    try {

        knex.from(table)
            .whereNotNull('deleted_at')
            .then(rows => {
                res.status(200).json(rows);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Get all langs by ID
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

//Get current language
router.get('/current/lang', verifyApiToken, async (req, res) => {
    try {

        knex(table)
            .where({ langs_default: true })
            .then(rows => {
                res.status(200).json(rows[0]);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Add lang
router.post('/', verifyApiToken, async (req, res) => {

    try {
        const { error } = createValidation(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });
        const { langs_title, langs_code, langs_flag, langs_default, langs_direction } = req.body;
        knex(table)
            .insert({
                "langs_title": langs_title,
                "langs_code": langs_code.toUpperCase(),
                "langs_flag": langs_flag ? langs_flag : null,
                "langs_default": langs_default,
                "langs_direction": langs_direction.toUpperCase(),
            })
            .then(id => {
                res.status(200).json(id);
            }).catch((err => {
                res.status(400).json({ message: err });
            }));
    } catch (err) {
        res.status(500).json({ message: err });
    }

});

//Update langs by ID
router.patch('/:id', verifyApiToken, async (req, res) => {
    try {
        const { error } = createValidation(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });
        const { langs_title, langs_code, langs_flag, langs_default, langs_direction } = req.body;
        knex(table)
            .where({ id: req.params.id })
            .update({
                "langs_title": langs_title,
                "langs_code": langs_code.toUpperCase(),
                "langs_flag": langs_flag ? langs_flag : null,
                "langs_default": langs_default,
                "langs_direction": langs_direction.toUpperCase(),
            })
            .then(id => {
                knex(table)
                    .whereNot({ id: req.params.id })
                    .update({
                        "langs_default": false,
                    })
                    .then(rows => {
                        res.status(200).json(rows);
                    });
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});


//Restor langs by ID
router.post('/restore/:id', verifyApiToken, async (req, res) => {
    try {
        knex(table)
            .where({ id: req.params.id })
            .update({
                "deleted_at": null,
            })
            .then(rows => {
                res.status(200).json(rows);
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Trash langs by ID
router.delete('/:id', verifyApiToken, async (req, res) => {
    try {
        knex(table)
            .where({ id: req.params.id })
            .update({
                "deleted_at": knex.fn.now(),
            })
            .then(rows => {
                res.status(200).json(rows);
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Delete langs by ID
router.delete('/destroy/:id', verifyApiToken, async (req, res) => {
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