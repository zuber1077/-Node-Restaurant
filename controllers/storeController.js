const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const User = mongoose.model('User');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');


const multerOptions = {
    storage: multer.memoryStorage(),
    fileFillter(req,file,next){
        const isPhoto = file.mimetype.startsWith('image/');
        if(isPhoto){
            next(null, true);
        }else{
            next({message: 'that filetype isn\'t allowed!'}, false)
        }
    }
}

exports.homePage = (req, res)=>{
    res.render('index');
}

exports.addStore = (req, res)=>{
    res.render('editStore', { title: '💩  Add Store'});
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res , next) => {
    // check if there is no file to resize
    if(!req.file){
        next(); // skip to z next middleWare
        return
    }
    const extension = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;
    // resize
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);
    // once we have written the photo to our fileSystem, keep going!
    next(); 
}

exports.createStore = async (req, res) => {
   req.body.author = req.user._id;
   const store = await (new Store(req.body)).save();
   req.flash('success', `Successfully Created ${store.name}. Care to reave a review?`);
   res.redirect(`/store/${store.slug}`);
}

exports.getStores =  async (req, res) =>{
    // 1. Query the db for a list of all stores
    const stores = await Store.find();
    res.render('stores', {title: 'Stores', stores});
}

const confirmOwner = (store, user) => {
    if (!store.author.equals(user._id)){
        throw Error('You must own a store in order to edit it!');
    }
}

exports.editStore = async (req, res) => {
    // 1. find z store given z ID
    const store = await Store.findOne({ _id: req.params.id});
    // 2. conform they are the owner of the store 
    confirmOwner(store, req.user);
    // 3. render out the edit form so the user can update they store
    res.render('editStore', {title: `Edit ${store.name}`, store}); // if z param.name & the variable.name is the same can be pass only 1 `store: store`
}

exports.updateStore = async (req, res) => {
    // set the location data to be a point
    req.body.location.type = 'Point';
    // 1. find and update z store
    const store = await Store.findOneAndUpdate({ _id: req.params.id}, req.body,{
        new: true, // return the new store instead of ald one
        runValidators: true  
    }).exec();
    req.flash("success", `successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store →</a>`);
    res.redirect(`/stores/${store._id}/edit`);
    // 2. redirect them the store and tell them it worked
};

exports.getStoreBySlug = async (req,res) => {
    const store = await Store.findOne({ slug: req.params.slug }).populate('author reviews');

    if (!store) return next();
    res.render('store', {store: store, title: store.name});
}

exports.getStoresByTag = async (req, res) => {
    const tag = req.params.tag;
    const tagQuery = tag || { $exists: true }; // Query all store on tag
    // const tagQuery = tag || { $exists: true, $ne: [] };
    const tagsPromise = Store.getTagsList(); 
    const storesPromise = Store.find({ tags: tagQuery });
    const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
    // var tags = result[0];
    // var stores = result[1];
    res.render('tags', { tags, title: 'Tags', tag , stores });
};

exports.searchStores = async (req, res) => {
    const stores = await Store
    // first find stores that mutch
    .find({
        $text: {
            $search: req.query.q
        }
    }, {
        score: { $meta: 'textScore' }
    })
    // then sort them 
    .sort({
        score: { $meta: 'textScore' }
    })
    // limit to only 5 results
    .limit(5);
    res.json(stores)
}

exports.mapStores = async (req, res) => {
    const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
    const q = {
        location: {
            $near: {
                $geometry: {
                    type: 'point',
                    coordinates
                },
                $maxDistance: 15000 // 15km
            } 
        }
    };

    const stores = await Store.find(q).select('slug name description location').limit(10);
    res.json(stores); 
};

exports.mapPage = (req, res) => {
    res.render('map', { title: 'Map' });
}

exports.heartStore = async (req, res) => {
    const hearts = req.user.hearts.map(obj => obj.toString());
    const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
    const user = await User
    .findByIdAndUpdate(req.user._id, 
        { [operator]: { hearts: req.params.id } },
        { new: true }
    );
    res.json(user)
}; 

exports.getHearts = async (req, res) => {
    const stores = await Store.find({
        _id: { $in: req.user.hearts } 
    });
    res.render('stores', { title: 'Hearted Stores' , stores});
};

exports.getTopStores = async (req, res) => {
    const stores = await Store.getTopStores();
    res.render('topStores', { stores, title: '⭐ Top Stores!' });
}

//  rick and morty
// black mirror
//  inception
