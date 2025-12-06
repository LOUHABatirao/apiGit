const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const dotenv = require('dotenv');
const verifyApiToken = require('../verify/verifyApiToken');

dotenv.config();


const table_category_items = `${process.env.DB_PREFIX}_category_items`;
const table_category_items_lang = `${process.env.DB_PREFIX}_category_items_lang`;
const table_langs = `${process.env.DB_PREFIX}_langs`;

//Get all categories_items by category id
router.get('/:id_cat', verifyApiToken, async (req, res) => {

    try {
        knex.from(table_langs)
            .where({ langs_default: true })
            .then(rows => {
                knex(table_category_items)
                    .select(table_category_items_lang + '.cat_item_slug', table_category_items_lang + '.cat_item_title', table_category_items_lang + '.id_lang', table_category_items_lang + '.id_cat_item')
                    .join(table_category_items_lang, table_category_items + '.id', '=', table_category_items_lang + '.id_cat_item')
                    .where('id_lang', rows[0].id)
                    .where('id_cat', req.params.id_cat)
                    .then(rows => {
                        res.status(200).json(rows);
                    });
            });



    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Get all categories_item by id_cat_item and lang
router.get('/item/:id_lang/:id_cat_item', verifyApiToken, async (req, res) => {

    try {
        knex(table_category_items_lang)
            .where('id_lang', req.params.id_lang)
            .where('id_cat_item', req.params.id_cat_item)
            .then(rows => {
                res.status(200).json(rows[0]);
            }).catch(err => res.status(500).json({ message: err }));

    } catch (err) {
        res.status(500).json({ message: err });
    }
});



//Add categories_items
router.post('/', verifyApiToken, async (req, res) => {

    try {
        const { id_cat, items } = req.body;
        !items.length && res.status(500).json({ message: 'No element Found' });

        const insertNewItem = async (item, id_cat_item) => {
            await knex(table_category_items_lang)
                .insert({
                    "cat_item_title": item.cat_item_title,
                    "cat_item_slug": item.cat_item_slug,
                    "meta_key": item.meta_key ? item.meta_key : null,
                    "meta_value": item.meta_value ? item.meta_value : null,
                    "id_cat_item": id_cat_item,
                    "id_lang": item.id_lang
                })
        }
        const updateNewItem = async (item, id_cat_item) => {
            await knex(table_category_items_lang)
                .where('id_cat_item', id_cat_item)
                .where('id_lang', item.id_lang)
                .update({
                    "cat_item_title": item.cat_item_title,
                    "cat_item_slug": item.cat_item_slug,
                    "meta_key": item.meta_key ? item.meta_key : null,
                    "meta_value": item.meta_value ? item.meta_value : null,
                    "id_lang": item.id_lang
                })
        }


        items.map((item, i) => {
            if (item.id_cat_item) {

                knex(table_category_items_lang)
                    .where('id_cat_item', item.id_cat_item)
                    .where('id_lang', item.id_lang)
                    .then(rows => {
                        if (rows.length) {
                            updateNewItem(item, item.id_cat_item);
                        } else {
                            insertNewItem(item, item.id_cat_item);
                        }
                        if (i == items.length - 1) {
                            res.status(200).json({ message: 'Items addes with success' });
                        }
                    });


            } else {
                knex(table_category_items)
                    .insert({
                        "id_cat": id_cat
                    })
                    .then(category_item => {
                        insertNewItem(item, category_item[0]);

                        if (i == items.length - 1) {
                            res.status(200).json({ message: 'Items addes with success' });
                        }
                    }).catch(function (err) {
                        res.status(500).json({ message: err });
                    })
            }

        })


    } catch (err) {
        res.status(500).json({ message: err });
    }

});


//Delete categories_items by ID
router.delete('/:id', verifyApiToken, async (req, res) => {
    try {
        knex(table_category_items)
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