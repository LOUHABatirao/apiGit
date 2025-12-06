const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const dotenv = require('dotenv');
const { json } = require('body-parser');
dotenv.config();
const verifyApiToken = require('../verify/verifyApiToken');


const post_type_table = `${process.env.DB_PREFIX}_post_type`;

//Get all post_type
router.get('/', verifyApiToken, async (req, res) => {

    try {

        knex.from(post_type_table)
            .whereNull('deleted_at')
            .then(rows => {
                res.status(200).json(rows);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Get all post_type
router.get('/trashed', verifyApiToken, async (req, res) => {

    try {

        knex.from(post_type_table)
            .whereNotNull('deleted_at')
            .then(rows => {
                res.status(200).json(rows);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Get all post_type by ID
router.get('/:id', verifyApiToken, async (req, res) => {
    try {

        knex.from(post_type_table)
            .where({ id: req.params.id })
            .then(rows => {
                res.status(200).json(rows);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Add post_type
router.post('/', verifyApiToken, async (req, res) => {

    try {

        knex(post_type_table)
            .insert({
                "post_type_title": req.body.name,
                "post_type_slug": req.body.slug,
            })
            .then(rows => {
                res.status(200).json(rows);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }

});

//Update post_type by ID
router.patch('/:id', verifyApiToken, async (req, res) => {

    try {

        knex(post_type_table)
            .where({ id: req.params.id })
            .update({
                "post_type_title": req.body.name,
                "post_type_slug": req.body.slug,
                "updated_at": knex.fn.now()
            })
            .then(rows => {
                res.status(200).json(rows);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});


//Restor post_type by ID
router.post('/restore/:id', verifyApiToken, async (req, res) => {
    try {
        knex(post_type_table)
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

//Trash post_type by ID

router.delete('/:id', verifyApiToken, async (req, res) => {
    try {
        knex(post_type_table)
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

router.delete('/destroy/:id', verifyApiToken, async (req, res) => {
    try {
        knex(post_type_table)
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