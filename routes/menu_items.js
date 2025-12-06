const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const dotenv = require('dotenv');
dotenv.config();
const verifyApiToken = require('../verify/verifyApiToken');

const table_menu_items = `${process.env.DB_PREFIX}_menu_items`;
const table_menu_lang = `${process.env.DB_PREFIX}_menu_items_lang`;
const table_langs = `${process.env.DB_PREFIX}_langs`;
//Get menu items by id and lang
router.get('/:id_menu/:id_lang', verifyApiToken, async (req, res) => {
    try {
        knex(table_menu_items)
            .select()
            .where('id_menu', req.params.id_menu)
            .where('id_lang', req.params.id_lang)
            .then(function (rows) {
                if (rows.length) {
                    let item = rows[0];
                    item.items = JSON.parse(rows[0].items);
                    res.status(200).json(item);
                } else {
                    res.status(200).json([]);
                }
            })
            .catch(function (err) {
                res.status(500).json({ message: err });
            })
    } catch (err) {
        res.status(500).json({ message: err });
    }
});
//Get menu items by id and lang
router.get('/langcode/:id_menu/:langs_code', verifyApiToken, async (req, res) => {
    try {
        knex(table_menu_items)
            .select()
            .join(table_langs, table_langs + '.id', table_menu_items + '.id_lang')
            .where(table_langs + '.langs_code', req.params.langs_code)
            .where('id_menu', req.params.id_menu)
            .then(function (rows) {
                if (rows.length) {
                    let item = rows[0];
                    item.items = JSON.parse(rows[0].items);
                    res.status(200).json(item);
                } else {
                    res.status(200).json([]);
                }
            })
            .catch(function (err) {
                res.status(500).json({ message: err });
            })
    } catch (err) {
        res.status(500).json({ message: err });
    }
});
//Get all menu_items by ID
router.get('/:id', verifyApiToken, async (req, res) => {
    try {
        knex(table_menu_items)
            .join(table_menu_lang, table_menu_items + '.id', '=', table_menu_lang + '.id')
            .where(table_menu_items + '.id', '=', req.params.id)
            .then(rows => {
                res.status(200).json(rows);
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});
//Add menu_items
router.post('/', verifyApiToken, async (req, res) => {

    try {
        const { id_menu, id_lang, items } = req.body;
        knex(table_menu_items)
            .select()
            .where('id_menu', id_menu)
            .where('id_lang', id_lang)
            .then(function (rows) {
                if (rows.length === 0) {
                    knex(table_menu_items)
                        .insert({
                            "id_menu": id_menu,
                            "id_lang": id_lang,
                            "items": JSON.stringify(items),
                        })
                        .then(rows => {
                            res.status(200).json(rows);
                        }).catch(err => {
                            res.status(400).json({ message: err });
                        });
                } else {
                    knex(table_menu_items)
                        .where('id', rows[0].id)
                        .update({
                            "id_menu": id_menu,
                            "id_lang": id_lang,
                            "items": JSON.stringify(items),
                        })
                        .then(rows => {
                            res.status(200).json(rows);
                        });
                }
            })
            .catch(function (err) {
                res.status(500).json({ message: err });
            })
    } catch (err) {
        res.status(500).json({ message: err });
    }
});
//Update menu_items by ID
router.patch('/:id', verifyApiToken, async (req, res) => {
    try {
        knex(table_menu_items)
            .where({ id: req.params.id })
            .update({
                "id_menu": req.body.id_menu,
                "id_post": req.body.id_post,
                "id_cat": req.body.id_cat,
            })
            .then(rows => {
                knex(table_menu_lang)
                    .where('id_menu_items', '=', req.params.id)
                    .update({
                        "menu_items_title": req.body.title,
                        "menu_items_url": req.body.url,
                        "id_lang": req.body.id_lang
                    })
                    .then(rows => {
                        res.status(200).json(rows);
                    });
            });
    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Delete menu_items by ID
router.delete('/:id', verifyApiToken, async (req, res) => {
    try {
        knex(table_menu_items)
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