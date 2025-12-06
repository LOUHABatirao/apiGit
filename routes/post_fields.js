const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const dotenv = require('dotenv');
dotenv.config();
const verifyApiToken = require('../verify/verifyApiToken');


const table_post_fields = `${process.env.DB_PREFIX}_post_fields`;

//Get all post_fields
router.get('/', verifyApiToken, async (req, res) => {

    try {

        knex.from(table_post_fields)
            .then(rows => {
                res.status(200).json(rows);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Get all post_fields by ID
router.get('/:id', verifyApiToken, async (req, res) => {
    try {

        knex.from(table_post_fields)
            .where({ id: req.params.id })
            .then(rows => {
                res.status(200).json(rows);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Add post_fields
router.post('/', verifyApiToken, async (req, res) => {
    /*
    {
        "post_fields_title": "page_template",
        "post_fields_fields": [{
            "name": "text",
            "text": "textfield"
        }],
        "id_post_type": 1,
        "id_cat": null
    }
    */

    try {
        knex(table_post_fields)
            .insert({
                "post_fields_title": req.body.post_fields_title,
                "post_fields_fields": JSON.stringify(req.body.post_fields_fields[0]),
                "id_post_type": req.body.id_post_type,
                "id_cat": req.body.id_cat
            })
            .then(rows => {
                res.status(200).json(rows);
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }

});

//Update post_fields by ID
router.patch('/:id', verifyApiToken, async (req, res) => {
    try {
        knex(table_post_fields)
            .where({ id: req.params.id })
            .update({
                "post_fields_title": req.body.post_fields_title,
                "post_fields_fields": JSON.stringify(req.body.post_fields_fields[0]),
                "id_post_type": req.body.id_post_type,
                "id_cat": req.body.id_cat,
                "updated_at": knex.fn.now()
            })
            .then(rows => {
                res.status(200).json(rows);
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});


//Delete post_fields by ID
router.delete('/:id', verifyApiToken, async (req, res) => {
    try {
        knex(table_post_fields)
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