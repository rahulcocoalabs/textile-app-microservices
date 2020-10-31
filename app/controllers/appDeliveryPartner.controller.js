var UserModel = require('../models/deliveryAgent.model');
var areacode = require('../models/areaCode.model');
var CartModel = require('../models/cart.model');
var addressModel = require('../models/address.model');
var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const paramsConfig = require('../../config/app.config');

var usersConfig = paramsConfig.user;
const params_Config = require('../../config/params.config');
const employeeModel = require('../models/employee.model');
const cartModel = require('../models/cart.model');
const { updateOne } = require('../models/areaCode.model');

const JWT_KEY = params_Config.development.jwt.secret;


exports.login = async (req, res) => {


    let params = req.body;

    if (!params.mobile || !params.password) {
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

    findCriteria.mobile = params.mobile;
    findCriteria.status = 1;


    let userData = await UserModel.findOne(findCriteria)
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
        const JWT_KEY = params_Config.development.jwt.secret;
        let payload = {};
        payload.id = userData.id;
        payload.email = userData.mobile;

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
            userInfo: {
                imageBase: usersConfig.imageBase,
                mobile: userData.mobile,

                name: userData.name,

                id: userData._id
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

exports.update = async(req,res) => {
    let userDataz = req.identity.data;
    let userId = userDataz.id;
    let params = req.body;
    let id = params.id;
    let update = params.update;
    var newValue = {};
    if (update == "accepted"){
        newValue.deliveryStatus = "accepted";
    }
    if (update == "picked"){
        newValue.deliveryStatus = "picked";
    }
    if (update == "delivered"){
        newValue.deliveryStatus = "delivered";
    }

    let cartData = await CartModel.updateOne({_id:id},newValue)
        .catch(err => {
            return {
                success: 0,
                message: 'unknown error',
                error: err
            }
        })

    if (cartData && cartData.success && (cartData.success === 0)) {
        return res.send({
            success: 0,
            message: "DB error"
        });
    }

    if (cartData){
        return res.send({
            success:1,
            message:"updated status"
        })
    }

}

exports.list = async (req, res) => {


    let userDataz = req.identity.data;
    let userId = userDataz.id;

    let query = req.query;


    var page = query.page || 1;
    page = page > 0 ? page : 1;
    var perPage = Number(query.perPage) || 30;
    perPage = perPage > 0 ? perPage : 30;
    var offset = (page - 1) * perPage;
    var pageParams = {
        skip: offset,
        limit: perPage
    };




    let findCriteria = {};

    findCriteria.status = 1;
    findCriteria.assignee = userId;
    // findCriteria.isConvertedToOrder = true;

    if (!params.status){
        return res.send({
            success:0,
            message:"please specify status "
        })
    }

    
    if (params.status == "accepted"){
        findCriteria.deliveryStatus = "accepted";
    }
    if (params.status == "picked"){
        findCriteria.deliveryStatus = "picked";
    }
    if (params.status == "delivered"){
        findCriteria.deliveryStatus = "delivered";
    }
     

    let projection = {};

    projection.address = 1;



    let cartData = await CartModel.find(findCriteria)
        .catch(err => {
            return {
                success: 0,
                message: 'unknown error',
                error: err
            }
        })

    if (cartData && cartData.success && (cartData.success === 0)) {
        return res.send({
            success: 0,
            message: "DB error"
        });
    }

    // return res.send(cartData);
    if (!cartData) {
        return res.status(200).send({
            success: 0,
            message: 'orders not exists'
        });
    };
    var objectArray = [];
    for (x in cartData) {

        let address = await addressModel.findOne({ _id: cartData[x].deliveryAddress }, { addressLane: 1, phone: 1, city: 1, name: 1, pin: 1 })
            .catch(err => {
                return {
                    success: 0,
                    message: 'unknown error',
                    error: err
                }
            })
            

        if (address && address.success && (address.success === 0)) {
            continue;
        }
        if (!address) {
            continue;
        }

        let object = {};
        object.id = cartData[x]._id;
        object.deliveryTime = cartData[x].deliveredAt;
        object.pickingTime = cartData[x].pickedAt;
        object.address = address;
        objectArray.push(object);
    }

    if (objectArray.length == 0) {
        return res.send({
            success: 0,

            message: "order list is empty"
        })
    }
    var itemsCount = await CartModel.countDocuments(findCriteria).catch(err => {
        return {
            success: 0,
            message: 'Something went wrong while checking phone',
            error: err
        }
    });
    var totalPages = itemsCount / perPage;
    totalPages = Math.ceil(totalPages);
    var hasNextPage = page < totalPages;
    let pageNum = Number(page) || "";
    let contentPage = Number(perPage) || "";
    var pagination = {
        page: pageNum,
        perPage: contentPage,
        hasNextPage: hasNextPage,
        totalItems: itemsCount,
        totalPages: totalPages
    }

    return res.send({
        success: 1,
        orders: objectArray,
        pagination,
        message: "listed orders"
    })





}

