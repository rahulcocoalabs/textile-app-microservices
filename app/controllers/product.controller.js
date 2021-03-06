const Product = require('../models/product.model');
const Category = require('../models/categories.model');
const OfferModel = require('../models/offers.model');
const Reviews = require('../models/review.model');
const Size = require('../models/size.model');
const Color = require('../models/color.model');
const Brand = require('../models/brands.model');
const Banner = require('../models/banner.model');
const User = require('../models/user.model');
const Variant = require('../models/variant.model');
const config = require('../../config/app.config');
const productConfig = config.products;
const ObjectId = require('mongoose').Types.ObjectId;
const Constants = require('../helpers/constants');
const brandsModel = require('../models/brands.model');
const productModel = require('../models/product.model');
const categoriesModel = require('../models/categories.model');
const colorModel = require('../models/color.model');
const bannerConfig = config.banners;
const productsConfig = config.products;
const categoriesConfig = config.categories;
const offerImageBase = config.offers.imageBase;
const categoriesImageBase = config.categories.imageBase;
const productImageBase = config.products.imageBase;

// *** Product listing with pagination ***
exports.list = async (req, res) => {
    let userDataz = req.identity.data;
    let userId = userDataz.id;
    let params = req.query;
    var search = params.search || '.*';
    search = search + '.*';
    let sortValue = params.sort;
    let filterValue = params.filter;
    let page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    let perPage = Number(params.perPage) || productConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : productConfig.resultsPerPage;
    let offset = (page - 1) * perPage;
    if (sortValue) {
        if ((sortValue != Constants.popular) && (sortValue != Constants.lowToHigh) && (sortValue != Constants.highToLow) && (sortValue != Constants.rating)) {
            return res.status(400).send({
                success: 0,
                message: 'incorrect sort value'
            })
        }
    }

    // sort
    let sort = {};
    if (sortValue == Constants.lowToHigh) {
        sort['sellingPrice'] = 1
    } else if (sortValue == Constants.highToLow) {
        sort['sellingPrice'] = -1
    } else if (sortValue == Constants.rating) {
        sort['averageRating'] = -1
    } else {
        sort['tsCreatedAt'] = -1
    }

    // filter
    var filter = {
        $or: [{
            name: {
                $regex: search,
                $options: 'i',
            }
        }]
    }

    if (params.brand) {
        var brandset = makejsonArrClr(params.brand)
        filter.brand = brandset
    }
    if (params.category) {
       // var categorySet = makejsonArrClr(params.category)
        filter.categories = {
            $elemMatch: {
                $in: params.category
            }
        }
    }

    //return res.send(params.size)



    if (params.size) {
        let sizes = makejsonArrClr(params.size);


        filter.sizes = {
            $elemMatch: {
                $in: sizes
            }
        }
    }


    if (params.color) {
        var clrArr = makejsonArrClr(params.color);
        var colors = [];
        for (x in clrArr) {
            let clr = clrArr[x]

            var colorfilter = {};
            colorfilter.status = 1
            colorfilter.name = clr
           
            var colorset = await colorModel.find(colorfilter, { _id: 1 });
            
            for (y in colorset){
                colors.push(colorset[y]._id);
            }
        }

        if (colors.length > 0) {
            filter.colors = {
                $elemMatch: {
                    $in: colors
                }
            }
        }

    }

    if (params.upperprice) {
        filter.lowerSellingPrice = {

            $lt: params.upperprice
        }
    }
    if (params.lowerprice) {
        filter.upperSellingPrice = {

            $gt: params.lowerprice
        }
    }

    if (params.test) {
        if (params.test == 1) {
            return res.send({
                filters: filter
            })
        }
    }

    // return res.send(filter)
    let projection = {

        name: 1,
        mainImage: 1,
        category: 1,
        sellingPrice: 1,
        costPrice: 1,
        averageRating: 1,
        brand: 1
    };
    try {
        let products = await Product.find(filter, projection).populate({
            path: 'brand',
            select: 'name'
        }).skip(offset).limit(perPage).sort(sort).lean();
        let itemsCount = await Product.countDocuments(filter);
        let productList = await favouriteOrNot(products, userId);
        totalPages = itemsCount / perPage;
        totalPages = Math.ceil(totalPages);
        let hasNextPage = page < totalPages;
        let pagination = {
            page: page,
            perPage: perPage,
            hasNextPage: hasNextPage,
            totalItems: itemsCount,
            totalPages: totalPages
        }
        res.status(200).send({
            success: 1,
            pagination: pagination,
            imageBase: productConfig.imageBase,
            items: productList
        });
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

async function favouriteOrNot(products, userId) {
    let userData = await User.findById({
        _id: userId,
        status: 1
    });
    let wishList = userData.wishlist;

    for (let i = 0; i < products.length; i++) {
        console.log('reached')

        if (wishList.includes(products[i]._id)) {
            products[i].isFavourite = true;
        } else {
            products[i].isFavourite = false;
        }
        console.log(products[i])
    }
    return products
}

// *** Product detail ***
exports.detail = async (req, res) => {
    let userDataz = req.identity.data;
    let userId = userDataz.id;
    let id = req.params.id;
    var isValidId = ObjectId.isValid(id);
    if (!isValidId) {
        var responseObj = {
            success: 0,
            status: 401,
            errors: {
                field: "id",
                message: "id is invalid"
            }
        }
        res.send(responseObj);
        return;
    };
    let filter = {
        _id: id,
        status: 1
    };
    // let projection = {
    //     name: 1,
    //     image: 1,
    //     category: 1,
    //     quantity: 1,
    //     subImages: 1,
    //     description: 1,
    //     costPrice: 1,
    //     sellingPrice: 1,
    //     averageRating: 1
    // };
    try {
        let productDetail = await Product.findOne(filter).populate([{
            path: 'colors',
            select: { value: 1, name: 1, image: 1 }
        }]).populate([{
            path: 'sizes',
            select: { value: 1, name: 1 }
        }]).populate([{
            path: 'variants'
        }]).populate({
            path: 'brand',
            select: { name: 1, image: 1 }
        }).lean();


        let userData = await User.findById({
            _id: userId,
            status: 1
        });
        let wishList = userData.wishlist;
        if (wishList.includes(productDetail._id)) {
            productDetail.isFavourite = true;
        } else {
            productDetail.isFavourite = false;
        }
        let totalReviews = await Reviews.countDocuments({
            product: id,
            status: 1
        });
        productDetail['totalReviews'] = totalReviews;
        // let relatedProducts = await Product.find({
        //     category: productDetail.category,
        //     _id: {
        //         $ne: productDetail._id
        //     },
        //     status: eeeeeeeeee
        // }, {
        //     name: 1,
        //     sellingPrice: 1,
        //     image: 1,
        //     averageRating: 1
        // }).populate({
        //     path: 'category',
        //     select: 'name'
        // }).lean();
        //relatedProducts = await favouriteOrNot(relatedProducts, userId);
        res.status(200).send({
            success: 1,
            imageBase: productsConfig.imageBase,
            item: productDetail,
            //relatedProducts: relatedProducts
        });
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
        
    }
}

// *** Home summary api ***
exports.home = async (req, res) => {
    let userDataz = req.identity.data;
    let userId = userDataz.id;
    try {

        var categories = await categoriesModel.find({ status: 1 }, { name: 1, image: 1 });
        var trending = await productModel.find({ status: 1, isTrending: true }, { name: 1, image: 1, averageRating: 1, mainImage: 1, sellingPrice: 1, costPrice: 1 }).populate({ path: 'brand', select: { name: 1 } });
        var popular = await productModel.find({ status: 1, isPopular: true }, { name: 1, image: 1, averageRating: 1, mainImage: 1, sellingPrice: 1, costPrice: 1 }).populate({ path: 'brand', select: { name: 1 } });
        var offers = await OfferModel.find({ status: 1 }, { image: 1 });
        let popularList = await favouriteOrNot(popular, userId);
        let trendingList = await favouriteOrNot(trending, userId);
        res.status(200).send({
            success: 1,
            offerImageBase: offerImageBase,
            categoriesImageBase: categoriesImageBase,
            productImageBase: productImageBase,
            categories: categories,
            trending: trendingList,
            popular: popularList,
            offers: offers
        });;
    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

function makejsonArr(str) {
    console.log(str)
    var result = str.substring(1, str.length - 1);

    console.log(result)
    let elements = result.split(",");
    console.log(elements);
    var arr = [];
    for (x in elements) {
        arr.push(ObjectId(elements[x]))
    }

    return arr;
}
function makejsonArrClr(str) {
    console.log(str)
    var result = str.substring(1, str.length - 1);

    console.log(result)
    let elements = result.split(",");
    console.log(elements);
    var arr = [];
    for (x in elements) {
        arr.push(elements[x])
    }

    return arr;
}