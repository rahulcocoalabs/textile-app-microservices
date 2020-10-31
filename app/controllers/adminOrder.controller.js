var OrderModel = require('../models/cart.model');
const config = require('../../config/app.config');
const categoryConfig = config.categories;




exports.list = async (req, res) => {
    let userDataz = req.identity.data;
    let userId = userDataz.id;

    let findCriteria = {};

    findCriteria.status = 1;

    let projection = {};


   
    var params = req.query;


    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || 30;
    perPage = perPage > 0 ? perPage : 30;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };


    let categoryData = await OrderModel.find(findCriteria, projection, pageParams)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while checking phone',
                error: err
            }
        })


    var itemsCount = await CategoryModel.countDocuments(findCriteria);
    totalPages = itemsCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    var pagination = {
        page: page,
        perPage: perPage,
        hasNextPage: hasNextPage,
        totalItems: itemsCount,
        totalPages: totalPages
    }
    if (categoryData && categoryData.success && categoryData.success === 0) {
        return res.send({
            success: 0,
            message: "Db error"
        })

    }
    else {
        if (categoryData.length == 0) {
            if (page == 1) {
                return res.send({
                    success: 0,
                    message: "No items to shoCategoryw"
                })
            } else {
                return res.send({
                    success: 0,
                    message: "No more items to show"
                })
            }
        }

        return res.send({
            success: 1,
            pagination,
            message: "Listing Categories",
            categoryImageBase: categoryConfig.imageBase,
            items: categoryData
        })
    }


}
