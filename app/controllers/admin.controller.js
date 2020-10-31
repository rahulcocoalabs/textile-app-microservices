var stringify = require('json-stringify-safe');
var EmployeeModel = require('../models/employee.model');
var CartModel = require('../models/cart.model');
var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const appsConfig = require('../../config/app.config');
const paramsConfig = require('../../config/params.config');

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