const { v4: uuid } = require('uuid');
const jimp = require('jimp');

const Ad = require('../models/Ad');
const Category = require('../models/Category');
const User = require('../models/User');
const State = require('../models/State');

// Function to add an image
const addImage = async (buffer) => {
    let newName = `${uuid()}.jpg`;
    let tmpImg = await jimp.read(buffer);
    tmpImg.cover(500, 500).quality(80).write(`./public/media/${newName}`);
    return newName;
}

module.exports = {
    // Get categories
    getCategories: async (req, res) => {
        const cats = await Category.find();

        let categories = [];

        for (let i in cats) {
            categories.push({
                ...cats[i]._doc,
                img: `${process.env.BASE}/assets/images/${cats[i].slug}.png`
            });
        }

        res.json({ categories });
    },

    // Add a new advertisement
    addAction: async (req, res) => {
        try {
            let { title, price, priceneg, desc, cat } = req.body;
            let token = req.headers['authorization'];

            const user = await User.findOne({ token }).exec();
            if (!user) {
                return res.json({ error: "User not found" });
            }

            if (!title || !cat) return res.json({ error: "Title and/or Category not provided" });
        
            if (cat.length < 12) return res.json({ error: "Invalid Category ID" });

            const category = await Category.findById(cat);
            if (!category) return res.json({ error: "Category not found" });
            
            if (price) {
                price = price.replace('.', '').replace(',', '.').replace('R$ ', '');
                price = parseFloat(price);
            } else {
                price = 0;
            }
    
            const newAd = new Ad();
    
            newAd.status = true;
            newAd.idUser = user._id;
            newAd.state = user.state;
            newAd.dateCreated = new Date();
            newAd.title = title;
            newAd.category = category._id;
            newAd.price = price;
            newAd.priceNegotiable = (priceneg == 'true' ? true : false);
            newAd.description = desc;
            newAd.views = 0;
    
            // Handling images
            if (req.files && req.files.img) {
                if (req.files.img.length == undefined) {
                    if (['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img.mimetype)) {
                        let url = await addImage(req.files.img.data);
                        newAd.images.push({
                            url,
                            default: false
                        });
                    }
                } else {
                    for (let i = 0; i < req.files.length; i++) {
                        if (['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img[i].mimetype)) {
                            let url = await addImage(req.files.img[i].data);
                            newAd.images.push({
                                url,
                                default: false
                            });
                        }
                    }
                }
            }
    
            if(newAd.images.length > 0){
                newAd.images[0].default = true;
            }
    
            const info = await newAd.save();
            res.json({ id: info._id });

        } catch (error) {
            res.json({ error: error.message });
        }
    },

    // Get list of advertisements
    getList: async (req, res) => {
        try {
            const { sort = 'asc', offset = 0, limit = 8, q, cat, state  } = req.query;
            let total = 0;
            let filters = { status: true };
    
            if (q) {
                filters.title = { '$regex': q, '$options': 'i' };
            }
    
            if (cat) {
                const c = await Category.findOne({ slug: cat }).exec();
                if (c) {
                    filters.category = c._id.toString();
                } else {
                    return res.json({ error: 'Category not found' });
                }
            }
    
            if (state) {
                const s = await State.findOne({ name: state.toUpperCase() }).exec();
                if (s) {
                    filters.state = s._id.toString();
                }
            }
    
            const adsTotal = await Ad.find(filters).exec();
            total = adsTotal.length;
    
            const adsData = await Ad.find(filters)
                .sort({ dateCreated: (sort == 'desc' ? -1 : 1) })
                .skip(parseInt(offset))
                .limit(parseInt(limit))
                .exec();

            let ads = [];
            for (let i in adsData) {
                let image; 
    
                let defaultImg = adsData[i].images.find(e => e.default == true);
                if (defaultImg) {
                    image = `${process.env.BASE}/media/${defaultImg.url}`;
                } else {
                    image = `${process.env.BASE}/media/default.jpg`;
                }
    
                ads.push({
                    id: adsData[i]._id,
                    title: adsData[i].title,
                    price: adsData[i].price,
                    priceNegotiable: adsData[i].priceNegotiable,
                    image
                });
            }
    
            return res.json({ ads, total, cat });
        } catch (error) {
            return res.status(500).json({ error: 'Server error: ' + error.message });
        }
    },

    // Get a specific advertisement item
    getItem: async (req, res) => {
        try {
            let { id, other = null } = req.query;

            if (!id) return res.json({ error: "No product" });

            if (id.length < 12) return res.json({ error: "Invalid ID" });

            const ad = await Ad.findById(id);
            if (!ad) return res.json({ error: "Product not found" });

            ad.views++;
            await ad.save();

            let images = [];
            for (let i in ad.images) {
                images.push(`${process.env.BASE}/media/${ad.images[i].url}`);
            }

            let category = await Category.findById(ad.category).exec();
            let userInfo = await User.findById(ad.idUser).exec();
            let stateInfo = await State.findById(ad.state).exec();

            let others = [];
            if (other) {
                const otherData = await Ad.find({ status: true, idUser: ad.idUser }).exec();

                for (let i in otherData) {
                    if (otherData[i]._id.toString() != ad._id.toString()) {
                        let image = `${process.env.BASE}/media/default.jpg`;

                        let defaultImg = otherData[i].images.find(e => e.default);
                        if (defaultImg) {
                            image = `${process.env.BASE}/media/${defaultImg}`;
                        }

                        others.push({
                            id: otherData[i]._id,
                            title: otherData[i].title,
                            price: otherData[i].price,
                            priceNegotiable: otherData[i].priceNegotiable,
                            image
                        });
                    }
                }
            }

            res.json({
                id: ad._id,
                title: ad.title,
                price: ad.price,
                priceNegotiable: ad.priceNegotiable,
                description: ad.description,
                dateCreated: ad.dateCreated,
                views: ad.views,
                images,
                userInfo: {
                    name: userInfo.name,
                    email: userInfo.email
                },
                stateName: stateInfo.name,
                others
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Edit an existing advertisement
    editAction: async (req, res) => {
        try {
            let { id } = req.params;
            let { title, status, price, priceneg, desc, cat, img, token } = req.body;

            if (id.length < 12) return res.json({ error: "Invalid ID" });

            const ad = await Ad.findById(id).exec();
            if (!ad) return res.json({ error: "Ad not found" });

            const user = await User.findOne({ token }).exec();
            if (!user) return res.json({ error: "User not found" });

            if (user._id.toString() != ad.idUser) return res.json({ error: "This ad is not yours" });

            let updates = {};
            if (title) updates.title = title;
            if (price) {
                price = price.replace('.', '').replace(',', '.').replace('R$ ', '');
                price = parseFloat(price);
                updates.price = price;
            }
            if (priceneg) updates.priceNegotiable = priceneg;
            if (status) updates.status = status;
            if (desc) updates.description = desc;
            if (cat) {
                const category = await Category.findOne({ slug: cat }).exec();
                if (!category) {
                    return res.json({ error: 'Category not found' });
                }
            }
                        
            // Handling images
            let images = ad.images;

            if (req.files && req.files.img) {
                if (req.files.img.length == undefined) {
                    if (['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img.mimetype)) {
                        let url = await addImage(req.files.img.data);
                        images.push({
                            url,
                            default: false
                        });
                    }
                } else {
                    for (let i = 0; i < req.files.length; i++) {
                        if (['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img[i].mimetype)) {
                            let url = await addImage(req.files.img[i].data);
                            images.push({
                                url,
                                default: false
                            });
                        }
                    }
                }
            }

            if (images) updates.images = images;

            await Ad.findByIdAndUpdate(id, { $set: updates });
        
            res.json({ error: '' });            

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
