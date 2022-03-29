const mongoose = require('mongoose');
const slug = require('slugs');

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: 'Please enter a store name' },
    slug: String,
    description: { type: String, trim: true },
    tags: [String],
    created: { type: Date, default: Date.now },
    location: {
      // see here for an explanation on this weird type nesting https://mongoosejs.com/docs/faq.html#type-key
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ['Point'], // 'location.type' must be 'Point'
        required: true,
        default: 'Point',
      },
      coordinates: [{ type: Number, required: 'Please supply coordinates' }],
      address: {
        type: String,
        required: 'Please supply an address',
      },
    },
    photo: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: 'You must provide an author',
    },
  },
  { toJSON: { virtuals: true } },
  { toObject: { virtuals: true } }
);

// define MongoDB indexes
storeSchema.index({ name: 'text', description: 'text' });
storeSchema.index({ location: '2dsphere' });

storeSchema.pre('save', async function (next) {
  if (!this.isModified('name')) return next();
  this.slug = slug(this.name);
  // const slugRegEx = new RegExp(`^(${this.slug})(-[0-9]+)?$`, 'i');
  const storesWithSlug = await this.constructor.find({
    slug: { $regex: new RegExp(`^(${this.slug})(-[0-9]+)?$`, 'i') },
  });
  if (storesWithSlug.length)
    this.slug = `${this.slug}-${storesWithSlug.length}`;
  next();
});

storeSchema.statics.aggregateTags = function () {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
  ]);
};

storeSchema.statics.getTopStores = function () {
  return this.aggregate([
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'store',
        as: 'reviews',
      },
    },
    {
      $match: {
        'reviews.1': { $exists: true },
      },
    },
    {
      $set: { averageRating: { $avg: '$reviews.rating' } },
    },
    { $sort: { averageRating: -1 } },
    { $limit: 10 },
  ]);
};

storeSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'store',
});

function autopopulate(next) {
  this.populate('reviews');
  next();
}

storeSchema.pre('find', autopopulate);
storeSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Store', storeSchema);
