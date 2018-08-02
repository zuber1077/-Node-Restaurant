const mongoose = require('mongoose');
const Store = mongoose.model('Store');
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

exports.createStore = async (req, res)=>{
   const store = await (new Store(req.body)).save();
   req.flash('success', `Successfully Created ${store.name}. Care to reave a review?`);
   res.redirect(`/store/${store.slug}`);
}

exports.getStores =  async (req, res) =>{
    // 1. Query the db for a list of all stores
    const stores = await Store.find();
    res.render('stores', {title: 'Stores', stores});
}

exports.editStore = async (req, res) =>{
    // 1. find z store given z ID
    const store = await Store.findOne({ _id: req.params.id});
    // 2. conform they are the owner of the store 
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

//  rick and morty
// black mirror
//  inception
