var stringify = require('json-stringify-safe');
var EmployeeModel = require('../models/employee.model');
var CartModel = require('../models/cart.model');
var OfferModel = require('../models/offers.model');
var productModel = require('../models/product.model');
var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const appsConfig = require('../../config/app.config');
const paramsConfig = require('../../config/params.config');
const offerImageBase = appsConfig.offers.imageBase;
const {
    hashSync
} = require('bcryptjs');

exports.details = async (req, res) => {
    let userDataz = req.identity.data;
    let userId = userDataz.id;
    params = req.body;
    let findCriteria = {};

    findCriteria.status = 1;
    findCriteria._id = params._id

    let projection = {};


    projection.tSCreatedAt_at = 0
    projection.tSModifiedAt_at = 0

    let Data = await EmployeeModel.findOne(findCriteria, projection)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while checking phone',
                error: err
            }
        })
    if (Data) {

        if (Data.related_products) {
            const rel = await listRelatedProducts(Data.related_products)
            return res.send({
                success: 1,
                item: categoryData,
                rel: rel
            })
        }


        return res.send({
            success: 1,
            item: Data
        })
    }


}
exports.list = async (req, res) => {

    let userDataz = req.identity.data;
    let userId = userDataz.id;

    let findCriteria = {};

    findCriteria.status = 1;

    let projection = {};

    projection.status = 1,
        projection.image = 1,
        projection.name = 1,
        projection.price = 1,
        projection._id = 0

    // pagination 

    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || 30 //feedsConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : 30//feedsConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };



    let categoryData = await EmployeeModel.find(findCriteria, projection, pageParams).limit(perPage).sort({
        "tsCreatedAt": -1
    })
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while checking phone',
                error: err
            }
        })


    var itemsCount = await AddressModel.countDocuments(findCriteria);
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
    if (categoryData) {

        return res.send({
            success: 1,
            pagination,
            items: categoryData,
            message: "List of Employess"
        })
    }

}


exports.create = async (req, res) => {
    var params = req.body;


    if (!params) {
        return res.send({
            success: 0,
            msg: "did not recieved any parameters"
        });
    }

    if (!params.email) {
        return res.send({
            success: 0,
            msg: "did not recieved email"
        });
    }
    if (!params.name) {
        return res.send({
            success: 0,
            msg: "did not recieved name"
        });
    }
    if (!params.password) {
        return res.send({
            success: 0,
            msg: "did not recieved password"
        });
    }
    if (!params.mobile) {
        return res.send({
            success: 0,
            msg: "did not recieved mobile"
        });
    }

    let findCriteria = {};

    findCriteria.email = params.email;
    findCriteria.status = 1;

    let userData = await EmployeeModel.findOne(findCriteria)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while checking phone',
                error: err
            }
        })
    if (userData) {

        return res.send({
            msg: "email already taken by some one"
        })
    }

    let findCriteria1 = {};

    findCriteria1.mobile = params.mobile;
    findCriteria1.status = 1;

    let userData1 = await EmployeeModel.findOne(findCriteria1)
        .catch(err => {
            return {
                success: 0,
                message: 'Something went wrong while checking phone',
                error: err
            }
        })
    if (userData1) {

        return res.send({
            msg: "email already taken by some one"
        })
    }

    try {

        const salt = bcrypt.genSaltSync(10);
        const passHash = bcrypt.hashSync(params.password, salt);

        const User = new EmployeeModel({
            status: 1,
            name: params.name,
            email: params.email,
            mobile: params.mobile,
            superUser: 1,
            passwordHash: passHash,

            tSCreatedAt: Date.now(),
            tSModifiedAt: null
        });
        var saveuser = await User.save();




        return res.status(200).send({
            success: 1,
            id: saveuser._id,

            message: 'Profile created successfully'
        });


    } catch (err) {
        res.status(500).send({
            success: 0,
            message: err.message
        })
    }
}

exports.login = async (req, res) => {


    let params = req.body;

    if (!params.email || !params.password) {
        var message = ''
        var errors = [];
        if (!params.email) {
            errors.push({
                field: "email",
                message: "email is missing"
            });
            message = "email is missing";
        }

        if (!params.password) {
            errors.push({
                field: "password",
                message: "password is missing"
            });
            message = "password is missing";
        }
        return res.status(200).send({
            success: 0,
            errors: errors,
            message,
            code: 200
        });
    }



    let findCriteria = {};

    findCriteria.email = params.email;
    findCriteria.status = 1;


    let userData = await EmployeeModel.findOne(findCriteria)
        .catch(err => {
            return {
                success: 0,
                message: 'unknown error',
                error: err
            }
        })

    if (userData && userData.success && (userData.success === 0)) {
        return res.send(userData);
    }
    if (!userData) {
        return res.status(200).send({
            success: 0,
            message: 'User not exists'
        });
    };

    let matched = await bcrypt.compare(params.password, userData.passwordHash)
    if (matched) {
        const JWT_KEY = paramsConfig.development.jwt.secret;
        let payload = {};
        payload.id = userData.id;
        payload.email = userData.email;

        payload.name = userData.name;


        payload.loginExpiryTs = "10h";
        var token = jwt.sign({
            data: payload,
        }, JWT_KEY, {
            expiresIn: "10h"
        });



        return res.send({
            success: 1,
            statusCode: 200,
            token,
            superuser: 1,
            userDetails: {
                name: payload.name,
                id: payload.id
            },
            message: 'Successfully logged in'
        })

    } else {
        return res.send({
            success: 0,
            statusCode: 401,

            message: 'Incorrect password'
        })
    }
}

exports.addUser = async (req, res) => {
    let params = req.body;

    if (!params.email || !params.password) {
        var message = ''
        var errors = [];
        if (!params.email) {
            errors.push({
                field: "email",
                message: "email is missing"
            });
            message = "email is missing";
        }

        if (!params.password) {
            errors.push({
                field: "password",
                message: "password is missing"
            });
            message = "password is missing";
        }
        return res.status(200).send({
            success: 0,
            errors: errors,
            message,
            code: 200
        });
    }



    let findCriteria = {};

    findCriteria.email = params.email;
    findCriteria.status = 1;


    let userData = await EmployeeModel.findOne(findCriteria)
        .catch(err => {
            return {
                success: 0,
                message: 'unknown error',
                error: err
            }
        })

    if (userData && userData.success && (userData.success === 0)) {
        return res.send(userData);
    }
    if (!userData) {
        return res.status(200).send({
            success: 0,
            message: 'User not exists'
        });
    };

    if (userData.superuser == 2) {
        return res.send("user not authorised");
    }

    let matched = await bcrypt.compare(params.password, userData.passwordHash)
    if (matched) {
        const JWT_KEY = paramsConfig.development.jwt.secret;
        let payload = {};
        payload.id = userData.id;
        payload.email = userData.email;

        payload.name = userData.name;


        payload.loginExpiryTs = "10h";
        var token = jwt.sign({
            data: payload,
        }, JWT_KEY, {
            expiresIn: "10h"
        });



        try {

            const salt = bcrypt.genSaltSync(11);
            const passHashEmp = bcrypt.hashSync(params.employeePassword, salt);

            const Employee = new EmployeeModel({
                status: 1,
                name: params.employeeName,
                email: params.employeeEmail,
                mobile: params.employeePhone,
                superUser: 2,
                passwordHash: passHashEmp,
                permissions: {
                    order: params.orderPermission,
                    product: params.productPermission
                },
                tSCreatedAt: Date.now(),
                tSModifiedAt: null
            });
            var saveEmployee = await Employee.save();
            return res.status(200).send({
                success: 1,
                id: saveEmployee._id,

                message: 'Profile tSCreatedAt successfully'
            });

        } catch (err) {

            console.log(err.message)
            res.status(500).send({
                success: 0,
                message: err
            })
        }

    } else {
        return res.send({
            success: 0,
            statusCode: 401,

            message: 'Incorrect password'
        })
    }
}

exports.addOffer = async (req, res) => {


    let params = req.body;

    let file = req.file;
    if (!file){
        return res.send({
            success:0,
            message:"please add image for offer"
        })
    }

    //var offerId = Date.now().toString().slice(5);

    var data = new OfferModel({

        status: 1,
        offerImageBase,
        image:file.filename,
        description: params.description,
        value: params.value,
        tsCreatedAt: Date.now()
    })

    var saveData = await data.save().catch(err => {
        return {
            success: 0,
            message: "adding new offer failed"
        }
    })

    if (!saveData) {
        return res.send({
            success: 0,
            message: "adding new offer failed"
        })
    }

    if (saveData.success == 0) {
        return res.send({
            success: 0,
            message: "adding new offer failed"
        })
    }



    return res.send({
        success: 1,
        message: "offer added to database",
        saveData
    })
}

exports.updateOffer = async (req, res) => {

    let userDataz = req.identity.data;
    let userId = userDataz.id;
    let params = req.body;




    let id = req.params.id;

    var update = {};


    if (params.value) {
        update.value = params.value;
    }

    if (params.description) {
        update.description = params.description;
    }

    var data = await OfferModel.findOne({ status: 1, _id: id }).catch(err => {
        return {
            success: 0,
            message: "did not updated offfer data, db error"
        }
    })
    if (!data) {
        return res.send({
            success: 0,
            message: "either this record deleted or invalid id"
        })
    }

    if (data.success === 0) {
        return res.send({
            success: 0,
            message: "either this record deleted or invalid id"
        })
    }

    var updated = await OfferModel.updateOne({
        _id: id
    },
        update
    ).catch(err => {
        return {
            success: 0,
            message: "something went wrong while accessing product collection"
        };
    });



    if (!updated) {
        return res.send({
            success: 0,
            message: "did not updated"
        })
    }

    return res.send({
        success: 1,
        message: " updated"
    })

}

exports.deleteOffer = async (req, res) => {
    let userDataz = req.identity.data;
    let userId = userDataz.id;


    let id = req.params.id;


    var data = await OfferModel.findOne({ status: 1, _id: id }).catch(err => {
        return {
            success: 0,
            message: "did not updated offfer data, db error"
        }
    })
    if (!data) {
        return res.send({
            success: 0,
            message: "either this record deleted or invalid id"
        })
    }

    if (data.success === 0) {
        return res.send({
            success: 0,
            message: "either this record deleted or invalid id"
        })
    }

    var updated = await OfferModel.updateOne({
        _id: id
    },
        { status: 0 }
    ).catch(err => {
        return {
            success: 0,
            message: "something went wrong while accessing product collection"
        };
    });



    if (!updated) {
        return res.send({
            success: 0,
            message: "did not updated"
        })
    }

    return res.send({
        success: 1,
        message: " removed"
    })


}

exports.listOffers = async (req, res) => {

    let params = req.query;

    var page = Number(params.page) || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(params.perPage) || 30 //feedsConfig.resultsPerPage;
    perPage = perPage > 0 ? perPage : 30 //feedsConfig.resultsPerPage;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };

    var saveData = await OfferModel.find({ status: 1 }, {}, pageParams).catch(err => {
        return {
            success: 0,
            message: "adding new tax failed"
        }
    })

    if (!saveData) {
        return res.send({
            success: 0,
            message: "adding new tax failed"
        })
    }

    if (saveData.success == 0) {
        return res.send({
            success: 0,
            message: "adding new tax failed"
        })
    }

    var itemsCount = await OfferModel.countDocuments({ status: 1 });

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

    return res.send({
        success: 1,
        items: saveData,
        pagination,
        message: "offers listed"
    })

}

exports.updateOfferToProducts = async (req, res) => {

    var id = req.params.id;
    var params = req.body;


    if (!params) {
        return res.send({
            success: 0,
            message: "pass info for updation"
        })
    }

    var products = params.products;
    if (!products) {
        return res.send({
            success: 0,
            message: "pass products for updation"
        })
    }

    if (products.length === 0) {
        return res.send({
            success: 0,
            message: "pass products for updation currently array is empty"
        })
    }

    var update = await updateProductForDiscount(products, res, id);

    return res.send({
        success: 0,
        message: "added successfully"
    })

}
async function updateProductForDiscount(products, res, id) {



    for (x in products) {

        let product = products[x];

        var data = await productModel.findOne({ _id: product, status: 1 }).catch(err => {
            return {
                success: 0,
                message: "item not found in product model"
            }
        })
        if (!data) {
            continue;
        }
        if (data.success === 0) {
            continue;
        }

        var offer = await OfferModel.findOne({ _id: id, status: 1 }).catch(err => {
            return {
                success: 0,
                message: "item not found in product model"
            }
        })
        if (!offer) {
            continue;
        }
        if (offer.success === 0) {
            continue;
        }
        if (!offer.value) {
            continue;
        }

        var price = data.sellingPrice;
        var cost = data.costPrice;

        price = cost * offer.value * (0.01);




        var updatedata = await productModel.updateOne({ _id: product, status: 1 }, { sellingPrice: price }).catch(err => {
            return res.send({
                success: 0,
                message: "item not found in product model",
                err: err.message
            })
        })

        if (!updatedata) {
            continue;
        }
        if (updatedata.success === 0) {
            continue;
        }

        var addProductArray = await addProductsToOffer(product, res, id)



    }


}

async function addProductsToOffer(product, res, id) {


    var data = await OfferModel.findOne({ _id: id, status: 1 }).catch(err => {
        return {
            success: 0,
            message: "item not found in offer model"
        }
    })
    if (!data) {

    }
    if (data.success === 0) {

    }



    var updatedata = await OfferModel.updateOne({ _id: id, status: 1 }, {
        $push: {
            productsAssigned: product
        }
    }).catch(err => {
        return {
            success: 0,
            message: err.message
        }
    })
    if (!updatedata) {
        return
    }
    if (updatedata.success === 0) {
        return
    }

    return

}