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

  tags: [String]
});

storeSchema.pre('save', function (next) {
  if(!this.isModified('name')){
    next(); // skip it
    return; // stop this function from running
  }

  this.slug = slag(this.name);
    next();
});


module.exports = mongoose.model('Store', storeSchema);