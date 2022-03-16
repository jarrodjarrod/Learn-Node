const mongoose = require('mongoose');
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
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
});

storeSchema.pre('save', function (next) {
  if (!this.isModified('name')) return next();
  this.slug = slug(this.name);
  next();
});

module.exports = mongoose.model('Store', storeSchema);
