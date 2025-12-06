const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const dotenv = require('dotenv');
const { createValidation } = require('../validation/langs')
const verifyApiToken = require('../verify/verifyApiToken');

dotenv.config();


const table_langs = `${process.env.DB_PREFIX}_langs`;
const table_locos = `${process.env.DB_PREFIX}_locos`;

//Get all Locos
router.get('/', verifyApiToken, async (req, res) => {

    try {
        knex
            .from(table_langs)
            .where({ langs_default: true })
            .then(langs => {
                knex
                    .select('id', 'text', 'translate', 'id_lang')
                    .from(table_locos)
                    .where('id_lang', langs[0].id)
                    .then(locos => {
                        res.status(200).json(locos);
                    });
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});
//Get all Locos
router.get('/:id_lang', verifyApiToken, async (req, res) => {

    try {
        knex
            .select('id', 'text', 'translate', 'id_lang')
            .from(table_locos)
            .where('id_lang', req.params.id_lang)
            .then(locos => {
                res.status(200).json(locos);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Get  Locos by text and lang_id
router.post('/translate', verifyApiToken, async (req, res) => {
    const { id_lang, text } = req.body;
    try {

        // get loco by text and lang 
        knex.from(table_locos)
            .where('id_lang', id_lang)
            .where('text', text)
            .then(locos => {
                //  check if we have loco  and get resp
                if (locos.length) {
                    res.status(200).json(locos[0]);
                } else {
                    // if we dont insert and get it 
                    knex(table_locos)
                        .insert({
                            "text": text,
                            "id_lang": id_lang,
                            "translate": text,
                        })
                        .then(newLoco => {

                            // get inserted loco by id 
                            knex
                                .select('id', 'text', 'translate', 'id_lang')
                                .from(table_locos)
                                .where('id', newLoco)
                                .then(loco => {
                                    res.status(200).json(loco[0]);
                                });
                        }).catch(err => {
                            res.status(400).json({ message: err });
                        });
                }


            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});
//Get  Locos by text and lang_id
router.post('/', verifyApiToken, async (req, res) => {
    const { text } = req.body;
    try {

        knex
            .from(table_langs)
            .where({ langs_default: true })
            .then(langs => {
                // get loco by text and lang 
                knex.from(table_locos)
                    .where('text', text)
                    .then(locos => {
                        //  check if we have loco  and get resp
                        if (locos.length) {
                            // if we dont insert and get it 
                            knex(table_locos)
                                .where('text', text)
                                .update({
                                    "text": text,
                                })
                                .then(newLoco => {
                                    res.status(200).json({ message: "updated" });
                                }).catch(err => {
                                    res.status(400).json({ message: err });
                                });
                        } else {
                            // if we dont insert and get it 
                            knex(table_locos)
                                .insert({
                                    "text": text,
                                    "id_lang": langs[0].id,
                                    "translate": text,
                                })
                                .then(newLoco => {
                                    res.status(200).json({ message: "inserted" });
                                }).catch(err => {
                                    res.status(400).json({ message: err });
                                });
                        }


                    });

            });



    } catch (err) {
        res.status(500).json({ message: err });
    }
});


//Update menu_items by ID
router.patch('/:id', verifyApiToken, async (req, res) => {
    const { id_lang, translate } = req.body;
    try {

        knex(table_locos)
            .where('id_lang', id_lang)
            .where({ id: req.params.id })
            .update({
                "translate": translate,
            })
            .then(row => {
                // get inserted loco by id 
                knex
                    .select('id', 'text', 'translate', 'id_lang')
                    .from(table_locos)
                    .where({ id: req.params.id })
                    .then(loco => {
                        res.status(200).json(loco[0]);
                    });
            }).catch(err => {
                res.status(400).json({ message: err });
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

module.exports = router;