const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const dotenv = require('dotenv');
dotenv.config();
const verifyApiToken = require('../verify/verifyApiToken');


const post_template_table = `${process.env.DB_PREFIX}_post_templates`;
const post_fields_table = `${process.env.DB_PREFIX}_post_fields`;


//Get all post_templates
router.get('/', verifyApiToken, async (req, res) => {

    try {

        knex.select(post_template_table + '.*', post_fields_table + '.post_fields_fields').from(post_template_table)
            .leftJoin(post_fields_table, post_template_table + '.id', '=', post_fields_table + '.id_post_templates')
            .whereNull('deleted_at')
            .then(rows => {
                res.status(200).json(rows);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});


//Get trashed post_templates
router.get('/trashed', verifyApiToken, async (req, res) => {

    try {

        knex.select(post_template_table + '.*', post_fields_table + '.post_fields_fields').from(post_template_table)
            .leftJoin(post_fields_table, post_template_table + '.id', '=', post_fields_table + '.id_post_templates')
            .whereNotNull('deleted_at')
            .then(rows => {
                res.status(200).json(rows);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Get all post_templates by ID
router.get('/:id', verifyApiToken, async (req, res) => {
    try {

        knex.select(post_template_table + '.*', post_fields_table + '.post_fields_fields').from(post_template_table)
            .leftJoin(post_fields_table, post_template_table + '.id', '=', post_fields_table + '.id_post_templates')
            .where(post_template_table + '.id', '=', req.params.id)
            .then(rows => {
                res.status(200).json(rows);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Add post_templates
router.post('/', verifyApiToken, async (req, res) => {

    try {
        knex(post_template_table)
            .insert({
                "postTemplates_name": req.body.postTemplatesTitle
            })
            .then(rows => {

                if (req.body.post_fields.length > 0) {

                    knex(post_fields_table)
                        .insert({
                            "post_fields_fields": JSON.stringify(req.body.post_fields),
                            "id_post_templates": rows[0]
                        })
                        .then(rows => { res.status(200).json(rows); });

                } else {
                    res.status(200).json(rows);
                }

            });

    } catch (err) {
        res.status(500).json({ message: err });
    }

});

//Update post_templates by ID
router.patch('/:id', verifyApiToken, async (req, res) => {
    try {
        knex(post_template_table)
            .where({ id: req.params.id })
            .update({
                "postTemplates_name": req.body.postTemplatesTitle,
            })
            .then(rows => {

                if (req.body.post_fields.length > 0) {

                    knex(post_fields_table)
                        .where({ id_post_templates: req.params.id })
                        .update({
                            "post_fields_fields": JSON.stringify(req.body.post_fields),
                            "updated_at": knex.fn.now()
                        })
                        .then(rows => { res.status(200).json(rows); });

                } else {
                    res.status(200).json(rows);
                }

            });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});


router.post('/restore/:id', verifyApiToken, async (req, res) => {
    try {
        knex(post_template_table)
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

//Trash post_templates by ID

router.delete('/:id', verifyApiToken, async (req, res) => {
    try {
        knex(post_template_table)
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

// destroy
router.delete('/destroy/:id', verifyApiToken, async (req, res) => {
    try {
        knex(post_template_table)
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