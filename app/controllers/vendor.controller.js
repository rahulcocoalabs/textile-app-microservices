var stringify = require('json-stringify-safe');
var VendorModel = require('../models/vendor.model');
var AgentModel = require('../models/deliveryagent.model');
var ProductModel = require('../models/product.model');
var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const paramsConfig = require('../../config/app.config');

    exports.add_product = async (req, res) => {

        let userDataz = req.identity.data;
        let userId = userDataz.id;
        let params = req.body;

        const user = await VendorModel.findOne({
            _id: userId,
            status: 1
        }, {
            superUser: 1,
            permissions: 1,
            _id: 0
        }).catch(err => {
            return res.send({
                success: 0,
                msg: "Could not access db"
            })
        })

        if (user.superUser == 2 && user.permissions.product == 2) {
            return res.send({
                success: 0,
                msg: "user not authorised"
            })
        }


        if (!params.name) {
            return res.send({
                success: 0,
                msg: "name not provided"
            })
        }
        if (!params.category) {
            return res.send({
                success: 0,
                msg: "category not provided"
            })
        }

        if (!params.price) {
            return res.send({
                success: 0,
                msg: "prie not provided"
            })
        }
        if (!params.qty) {
            return res.send({
                success: 0,
                msg: "quantity not provided"
            })
        }
        if (params.discount > 99) {
            return res.send({
                success: 0,
                msg: "discount is not feasible"
            })
        }


        const last = await ProductModel.find({}).sort({
            _id: -1
        }).limit(1);

        const lastid = last[0].id || 0;
        const new_id = lastid + 1;
        var formattedNumber_id = ("0" + new_id).slice(-2);
        const new_sku = params.parent + "_" + formattedNumber_id + "_" + userId;



        try {



            const Prod = new ProductModel({
                status: 1,
                name: params.name,
                description: params.description,
                qty: params.qty,
                category: params.category,
                discount: params.discount || 0,
                price: params.price,
                meter: params.meter,
                variants_exists: params.variantsAvailable,
                tSCreatedAt: Date.now(),
                tSModifiedAt: null,


                id: new_id,
                sku: new_sku,
                currency: params.currency || "INR",
                rebate_price: params.rebated_price,
                isActive: true,
                isFeaturedNew: params.isnew || false,
                inPromotion: params.ispromoted || false,
                parentProductId: 0,
                numberRemaining: params.qty,
                numberSold: 0,
                avaregeRating: 0
            });
            var prod = await Prod.save();

            if (prod) {
                if (params.variantsAvailable && params.array && prod._id) {
                    await addVariantProduct(params.array, prod._id)
                }
            }


            return res.status(200).send({
                success: 1,
                id: prod._id,

                message: 'Product tSCreatedAt successfully'
            });


        } catch (err) {
            res.status(500).send({
                success: 0,
                message: err.message
            })
        }


    }


    exports.show = async (req, res) => {


        let userDataz = req.identity.data;
        let userId = userDataz.id;

        let findCriteria = {};
        findCriteria._id = userId;
        findCriteria.status = 1;
        let projectCriteria = {};
        projectCriteria.name = 1;
        projectCriteria.email = 1;
        projectCriteria.mobile = 1;
        projectCriteria._id = 1

        var data = await VendorModel.findOne(findCriteria, projectCriteria)
            .catch(err => {
                return {
                    success: 0,
                    message: 'did not get cart for the user',
                    error: err
                }
            })

        if (!data) {
            return {
                success: 0,
                message: 'did not get cart for the user'

            }
        }

        return res.send({
            profile: data
        });
    }

    exports.add_devivery_agent = async (req, res) => {
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

        findCriteria.mobile = params.mobile;
        findCriteria.status = 1;

        let userData = await AgentModel.findOne(findCriteria)
            .catch(err => {
                return {
                    success: 0,
                    message: 'Something went wrong while checking phone',
                    error: err
                }
            })
        if (userData) {

            return res.send({
                msg: "mobile already registered by some one"
            })
        }

        try {

            const salt = bcrypt.genSaltSync(10);
            const passHash = bcrypt.hashSync(params.password, salt);

            const User = new AgentModel({
                status: 1,
                name: params.name,
                email: params.email,
                mobile: params.mobile,
                passwordHash: passHash,
                tSCreatedAt: Date.now(),
                tSModifiedAt: null
            });
            var saveuser = await User.save();




            return res.status(200).send({
                success: 1,
                id: saveuser._id,

                message: 'Profile tSCreatedAt successfully'
            });


        } catch (err) {
            res.status(500).send({
                success: 0,
                message: err.message
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

        let userData = await VendorModel.findOne(findCriteria)
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

        try {

            const salt = bcrypt.genSaltSync(10);
            const passHash = bcrypt.hashSync(params.password, salt);

            const User = new VendorModel({
                status: 1,
                name: params.name,
                email: params.email,
                mobile: params.mobile,
                passwordHash: passHash,
                tSCreatedAt: Date.now(),
                tSModifiedAt: null
            });
            var saveuser = await User.save();




            return res.status(200).send({
                success: 1,
                id: saveuser._id,

                message: 'Profile tSCreatedAt successfully'
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


        let userData = await VendorModel.findOne(findCriteria)
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

            // let updatedData = await AccountsModel.update(findCriteria, {
            //     $push: {
            //         log: {
            //          time:Date.now(),
            //          status:1
            //         }
            //       }
            // })
            // .catch(err => {
            //     return {
            //         success: 0,
            //         message: 'Something went wrong while updating restaurant user',
            //         error:  err
            //     }
            // })

            return res.send({
                success: 1,
                statusCode: 200,
                token,
                userDetails: payload,
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
