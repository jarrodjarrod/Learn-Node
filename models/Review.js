const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  created: { type: Date, default: Date.now },
  rating: { type: Number, min: 1, max: 5 },
  text: {
    type: String,
    required: 'Please include a comment with your rating',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: 'You must provide an author',
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: 'You must provide an author',
  },
});

function autoPopulate(next) {
  this.populate('author');
  next();
}

reviewSchema.pre('find', autoPopulate);
reviewSchema.pre('findOne', autoPopulate);

module.exports = mongoose.model('Review', reviewSchema);
