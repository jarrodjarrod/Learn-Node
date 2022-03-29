const multer = require('multer');
const uuid = require('uuid');
const jimp = require('jimp');
const Store = require('../models/Store');
const User = require('../models/User');

exports.getStoresByTag = async (req, res) => {
  const { tag } = req.params;
  const tagQuery = tag === 'all' ? { $exists: true } : tag || { $exists: true };
  const [tags, stores] = await Promise.all([
    Store.aggregateTags(),
    Store.find({ tags: tagQuery }),
  ]);

  res.render('tags', { title: 'Tags', tag, tags, stores });
};

exports.showStore = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug }).populate(
    'author reviews'
  );
  if (!store) return next();
  res.render('store', { title: store.name, store });
};

exports.homePage = (req, res) => {
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
};

exports.upload = multer({
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    if (file.mimetype.startsWith('photo/')) return next(null, true);
    next({ message: 'file is not an photo' }, null);
  },
}).single('photo');

exports.resize = async (req, res, next) => {
  if (!req.file) return next();
  const extension = req.file.mimetype.match(/(?<=\/)\w+/)[0];
  req.body.photo = `${uuid.v4()}.${extension}`;
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  next();
};

exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  const store = await new Store(req.body).save();
  req.flash('success', `Successfully created ${store.name}`);
  res.redirect(`/stores/${store.slug}`);
};

exports.getStores = async (req, res) => {
  const page = req.params.page || 1;
  const limit = 6;
  const skip = page * limit - limit;

  const [stores, count] = await Promise.all([
    Store.find().skip(skip).limit(limit).sort('-created'),
    Store.count(),
  ]);

  const pages = Math.ceil(count / limit);

  res.render('stores', { title: 'Stores', stores, page, pages, count });
};

const confirmStoreAuthor = (store, user) => {
  if (!store.author.equals(user._id))
    throw Error("You can't edit this store because you aren't the author");
};

exports.editStore = async (req, res) => {
  const store = await Store.findById(req.params.id);
  confirmStoreAuthor(store, req.user);
  res.render('editStore', { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
  // set the location object's type to 'Point'
  req.body.location.type = 'Point';
  const store = await Store.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  req.flash(
    'success',
    `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View ${store.name} ➡️</a>`
  );

  res.redirect(`stores/${store._id}/edit`);
};

exports.searchStores = async (req, res) => {
  const stores = await Store.find(
    { $text: { $search: req.query.q } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(5);
  res.json(stores);
};

exports.mapStores = async ({ query: { lng, lat } }, res) => {
  const coordinates = [lng, lat].map(parseFloat);
  const q = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates,
        },
        $maxDistance: 10000,
      },
    },
  };

  const stores = await Store.find(q)
    .select('name slug description location photo')
    .limit(10);

  res.json(stores);
};

exports.mapPage = (req, res) => res.render('map', { title: 'Map' });

exports.heartStore = async (req, res) => {
  const hearts = req.user.hearts.map((obj) => obj.toString());
  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { [operator]: { hearts: req.params.id } },
    { new: true }
  );
  res.json(user);
};

exports.renderHearts = async (req, res) => {
  // const stores = await Store.find({ _id: { $in: req.user.hearts } });
  const { hearts: stores } = await User.findById(req.user._id).populate(
    'hearts'
  );

  res.render('stores', { title: 'Your favourite stores', stores });
};

exports.getTopStores = async (req, res) => {
  const stores = await Store.getTopStores();
  res.render('topStores', { stores, title: '★ Top Stores' });
};
