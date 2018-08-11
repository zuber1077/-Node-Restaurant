const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');


const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: "please enter a store name"
  },

  slug: String, // pre save huge in mongodb

  description: {
    type: String,
    trim: true
  },

  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location:{
    type: {
      type: String,
      default: 'Point'
    },
    coordinates:[{
      type: Number,
      required: 'You must supply coordinates!'
    }],
    address: {
      type: String,
      required: 'You must supply address!'
    }
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author'
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Define indexes
// storeSchema.index({
//   name: 'text',
//   description: 'text'
// });

storeSchema.index({ location: '2dsphere' })

storeSchema.pre('save', async function(next) {
  if(!this.isModified('name')){
    next(); // skip it
    return; // stop this function from running
  }

  this.slug = slug(this.name);
  // find other stores that have a slug of zub, zub-1, zub-2
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }
    next();
});

storeSchema.statics.getTagsList = function () {
  return this.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
}

storeSchema.statics.getTopStores = function () {
  return this.aggregate([
    // Lookup Stores and populate their reviews
    // filler for only items that have 2 or more reviews
    // And the average reviews field
    // sort it by new field, highest reviews first 
    // limit to as most 10
  ]);
}

// find reviews where the stores _id property === reviews store property
storeSchema.virtual('reviews', {
  ref: 'Review', // what model it link?
  localField: '_id', // what field on the store?
  foreignField: 'store' // what field on the reviews?
});

module.exports = mongoose.model('Store', storeSchema);