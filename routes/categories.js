const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const dotenv = require('dotenv');
dotenv.config();
const verifyApiToken = require('../verify/verifyApiToken');


const { createValidation } = require('../validation/categories')
const table_categories = `${process.env.DB_PREFIX}_categories`;
const table_categories_lang = `${process.env.DB_PREFIX}_categories_lang`;
const table_post_type_categories = `${process.env.DB_PREFIX}_post_type_categories`;
const post_type_table = `${process.env.DB_PREFIX}_post_type`;
const table_langs = `${process.env.DB_PREFIX}_langs`;
const table_category_items = `${process.env.DB_PREFIX}_category_items`;
const table_category_items_lang = `${process.env.DB_PREFIX}_category_items_lang`;

//Get all categories
router.get('/', verifyApiToken, async (req, res) => {

    try {
        knex.from(table_langs)
            .where({ langs_default: true })
            .then(rows => {
                if (!rows.length) res.status(200).json([]);
                knex(table_categories).select(table_categories + '.*', table_categories_lang + '.*')
                    .join(table_categories_lang, table_categories + '.id', '=', table_categories_lang + '.id_cat')
                    .where('id_lang', rows[0].id)
                    .whereNull(table_categories + '.deleted_at')
                    .then(categories => {
                        if (!categories.length) res.status(200).json([]);
                        categories.map((category, i) => {
                            knex(table_category_items)
                                .select(table_category_items + '.id', table_category_items_lang + '.cat_item_slug', table_category_items_lang + '.cat_item_title', table_category_items_lang + '.id_lang', table_category_items_lang + '.id_cat_item')
                                .join(table_category_items_lang, table_category_items + '.id', '=', table_category_items_lang + '.id_cat_item')
                                .where('id_lang', rows[0].id)
                                .where('id_cat', category.id_cat)
                                .then(items => {
                                    categories[i].items = items;
                                    if (i == categories.length - 1) {
                                        res.status(200).json(categories);
                                    }

                                });
                        })

                    });
            });



    } catch (err) {
        res.status(500).json({ message: err });
    }

});

//Get all categories in trash
router.get('/trashed', verifyApiToken, async (req, res) => {

    try {
        knex.from(table_langs)
            .where({ langs_default: true })
            .then(rows => {
                if (!rows.length) res.status(200).json([]);
                knex(table_categories).select(table_categories + '.*', table_categories_lang + '.*')
                    .join(table_categories_lang, table_categories + '.id', '=', table_categories_lang + '.id_cat')
                    .where('id_lang', rows[0].id)
                    .whereNotNull(table_categories + '.deleted_at')
                    .then(categories => {
                        if (!categories.length) res.status(200).json([]);
                        categories.map((category, i) => {
                            knex(table_category_items)
                                .select(table_category_items + '.id', table_category_items_lang + '.cat_item_slug', table_category_items_lang + '.cat_item_title', table_category_items_lang + '.id_lang', table_category_items_lang + '.id_cat_item')
                                .join(table_category_items_lang, table_category_items + '.id', '=', table_category_items_lang + '.id_cat_item')
                                .where('id_lang', rows[0].id)
                                .where('id_cat', category.id_cat)
                                .then(items => {
                                    categories[i].items = items;
                                    if (i == categories.length - 1) {
                                        res.status(200).json(categories);
                                    }

                                });
                        })

                    });
            });



    } catch (err) {
        res.status(500).json({ message: err });
    }

});

//Get all by post type
router.get('/post-type/:id_post_type', verifyApiToken, async (req, res) => {

    try {
        knex.from(table_langs)
            .where({ langs_default: true })
            .then(rows => {

                knex(table_post_type_categories)
                    .select(table_post_type_categories + '.id as category_post_type_id', table_categories_lang + '.categories_title', table_categories + '.id as category_id', table_categories + '.deleted_at', table_category_items_lang + '.cat_item_slug', table_category_items_lang + '.cat_item_title', table_category_items_lang + '.id_lang', table_category_items_lang + '.id_cat_item')
                    .join(table_categories, table_categories + '.id', '=', table_post_type_categories + '.id_cat')
                    .join(table_categories_lang, table_categories + '.id', '=', table_categories_lang + '.id_cat')
                    .join(table_category_items, table_category_items + '.id_cat', '=', table_categories + '.id')
                    .join(table_category_items_lang, table_category_items + '.id', '=', table_category_items_lang + '.id_cat_item')
                    .where(table_categories_lang + '.id_lang', rows[0].id)
                    .where(table_category_items_lang + '.id_lang', rows[0].id)
                    .whereNull(table_categories + '.deleted_at')
                    .where('id_post_type', req.params.id_post_type)
                    .then(rows => {

                        const categories = rows.map(row => {
                            return {
                                categories_title: row.categories_title,
                                category_post_type_id: row.category_post_type_id
                            }
                        });
                        const items = rows.map(row => {
                            return {
                                cat_item_title: row.cat_item_title,
                                id: row.id_cat_item,
                                category_post_type_id: row.category_post_type_id,
                                cat_item_slug: row.cat_item_slug,
                                id_lang: row.id_lang,
                                category_id: row.category_id,
                            }
                        });
                        var uniq = {}
                        const groupedCategories = categories.filter(obj => !uniq[obj.category_post_type_id] && (uniq[obj.category_post_type_id] = true));
                        let categories_items = [];
                        groupedCategories.forEach(cat => {
                            let catItems = [];
                            items.forEach(item => {
                                if (item.category_post_type_id == cat.category_post_type_id) {
                                    catItems.push(item);
                                }
                            });
                            cat.items = catItems;
                            categories_items.push(cat);

                        });

                        res.status(200).json(categories_items);
                    });

            });

    } catch (err) {
        res.status(500).json({ message: err });
    }

});

//Get all categories by ID
router.get('/:id', verifyApiToken, async (req, res) => {
    try {

        knex(table_categories)
            .join(table_categories_lang, table_categories + '.id', '=', table_categories_lang + '.id_cat')
            .whereNull(table_categories + '.deleted_at')
            .where(table_categories + '.id', '=', req.params.id)
            .then(category => {
                knex(post_type_table)
                    .join(table_post_type_categories, post_type_table + '.id', '=', table_post_type_categories + '.id_post_type')
                    .where(table_post_type_categories + '.id_cat', '=', req.params.id)
                    .then(rows => {
                        if (rows.length) {
                            const postTypes = [];
                            rows.filter(row => {
                                let option = {
                                    label: row.post_type_title,
                                    value: row.id_post_type
                                }
                                postTypes.push(option);
                            })
                            category[0].post_types = postTypes;
                        } else {
                            category[0].post_types = [];

                        }
                        // start here 
                        res.status(200).json(category[0]);
                    });
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Get all categories by Lang
router.get('/:id_cat/:id_lang', verifyApiToken, async (req, res) => {
    try {

        knex(table_categories)
            .join(table_categories_lang, table_categories + '.id', '=', table_categories_lang + '.id_cat')
            .where(table_categories + '.id', '=', req.params.id_cat)
            .where(table_categories_lang + '.id_lang', '=', req.params.id_lang)
            .whereNull(table_categories + '.deleted_at')
            .then(category => {
                if (!category[0]) return res.status(200).json([]);
                res.status(200).json(category[0]);
            });

    } catch (err) {
        res.status(500).json({ message: err });
    }
});

//Add category

const saveCategoryHandler = (body, res) => {

    knex(table_categories)
        .insert({
            "id_cat_parent": body.id_cat_parent != "" ? body.id_cat_parent : null,
            "id_post_template": body.id_post_template != "" ? body.id_post_template : null
        })
        .then(cat => {
            knex(table_categories_lang)
                .insert({
                    "categories_title": body.categories_title,
                    "categories_slug": body.categories_slug,
                    "id_lang": body.id_lang,
                    "id_cat": cat[0],
                })
                .then(rows => {
                    const postTypes = body.post_types;
                    insertPostTypesHandler(postTypes, cat[0], res);

                }).catch((err) => {
                    return res.status(500).json({ message: err });
                });

        }).catch((err) => {
            return res.status(500).json({ message: err });
        });

}

const insertPostTypesHandler = (post_types, id_cat, res) => {
    knex(table_post_type_categories)
        .where({ id_cat: id_cat })
        .del()
        .then(post_type_categories => {
            if (!post_types.length) res.status(200).json(post_type_categories);
            const postTypesToInsert = post_types.map(
                (post, i) => {
                    return {
                        "id_post_type": post.value,
                        "id_cat": id_cat,
                    }
                }
            )

            knex(table_post_type_categories)
                .insert(postTypesToInsert)
                .then(rows => {
                    return res.status(200).json(rows);
                }).catch((err) => {
                    return res.status(500).json({ message: err });
                });

        })
}

router.post('/', verifyApiToken, async (req, res) => {

    try {
        const { error } = createValidation(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        saveCategoryHandler(req.body, res);

    } catch (err) {
        res.status(500).json({ message: err });
    }

});

//Update categories by ID
router.patch('/:id', verifyApiToken, async (req, res) => {
    try {
        const { error } = createValidation(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });
        const id_cat = req.params.id;
        const { id_cat_parent, id_post_template, id_lang, categories_slug, categories_title, post_types } = req.body;


        knex(table_categories)
            .where({ id: id_cat })
            .update({
                "id_cat_parent": id_cat_parent != "" ? id_cat_parent : null,
                "id_post_template": id_post_template != "" ? id_post_template : null
            })
            .then(categories => {

                knex(table_categories_lang)
                    .where('id_cat', '=', id_cat)
                    .where('id_lang', '=', id_lang)
                    .then(categories_lang => {

                        if (categories_lang.length) {
                            knex(table_categories_lang)
                                .where('id_cat', '=', id_cat)
                                .where('id_lang', '=', id_lang)
                                .update({
                                    "categories_title": categories_title,
                                    "categories_slug": categories_slug,
                                }).then(rows => {

                                    insertPostTypesHandler(post_types, id_cat, res);

                                });
                        } else {

                            knex(table_categories_lang)
                                .insert({
                                    "categories_title": categories_title,
                                    "categories_slug": categories_slug,
                                    "id_lang": id_lang,
                                    "id_cat": id_cat,
                                })
                                .then(rows => {
                                    insertPostTypesHandler(post_types, id_cat, res);
                                }).catch((err) => {
                                    return res.status(500).json({ message: err });
                                });


                        }


                    })

            })
    } catch (err) {
        res.status(500).json({ message: err });
    }
});


//Restor Category by ID
router.post('/restore/:id', verifyApiToken, async (req, res) => {
    try {
        knex(table_categories)
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

// Add to trash 
router.delete('/:id', verifyApiToken, async (req, res) => {
    try {
        knex(table_categories)
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


//Delete categories by ID
router.delete('/destroy/:id', verifyApiToken, async (req, res) => {
    try {
        knex(table_categories)
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