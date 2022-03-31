const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const tagData = await Tag.findAll({
      include: [{ model: Product, through: ProductTag, as: 'tag_products' }]
    });
    res.status(200).json(tagData);
  }
  catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product }]
    });
    if (!tagData) {
      res.status(404).json({ message: 'No tag found' });
      return;
    }
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', (req, res) => {
  // create a new tag
  Tag.create(req.body)
  .then((tag) => {
    if (req.body.tagIds.length) {
      const TagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          tag_id: tag.id,
          tag_id
        };
      });
      return Tag.bulkCreate(TagIdArr);
    }
    res.status(200).json(tag);
  })
  .then((TagIds) => res.status(200).json(TagIds))
  .catch((err) => {
    console.log(err);
    res.status(400).json(err);
  });
  
});

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
  Tag.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return Tag.findAll({ where: { tag_id: req.params.id } });
    })
    .then((Tags) => {
      // get list of current tag_ids
      const TagIds = Tags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            tag_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const TagsToRemove = Tags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        Tag.destroy({ where: { id: TagsToRemove } }),
        Tag.bulkCreate(newTags),
      ]);
    })
    .then((updatedTags) => res.json(updatedTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value
  try{
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product, through: ProductTag, as: 'tag_products'}]
    });
    if (!tagData) {
      res.status(404).json({message: 'No tag found'});
      return;
    } else {
      await Tag.destroy({
        where: {
          tag_id: req.params.id
        }
      });
    }
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
