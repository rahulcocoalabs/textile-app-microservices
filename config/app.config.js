// var commonStorePath = 'http://172.105.33.226/bakery-ecommerce-images';
var commonStorePath = 'http://45.79.120.216/textile-ecommerce-images';

var commonImageStorePath = '/var/www/html/textile-ecommerce-images/'
module.exports = {
  gateway: {
    url: "http://localhost:5000"
  },
  otp: {
    expirySeconds: 2 * 60
  },
  user: {
     imageUploadPath: 'uploads',
    //imageUploadPath: commonImageStorePath + 'users/',
    imageBase: commonStorePath + '/users/',
    resultsPerPage: 30
  },
  cart: {
    resultsPerPage: 30
  },
  order: {
    resultsPerPage: 30
  },
  banners: {
    //imageUploadPath: 'uploads',
    imageUploadPath: commonImageStorePath + 'banners/',
    imageBase: commonStorePath + '/banners/'
  },
  categories: {
   //imageUploadPath: 'uploads',
    imageUploadPath: commonImageStorePath + 'categories/',
    imageBase: commonStorePath + '/categories/'
  },
  offfers: {
    //imageUploadPath: 'uploads',
     imageUploadPath: commonImageStorePath + 'offers/',
     imageBase: commonStorePath + '/categories/'
   },
  brands: {
    //imageUploadPath: 'uploads',
   imageUploadPath: commonImageStorePath + 'categories/',
   imageBase: commonStorePath + '/brands/'
 },
  products: {
     //imageUploadPath: 'uploads',
    imageUploadPath: commonImageStorePath + 'products/',
    imageBase: commonStorePath + '/products/',
    resultsPerPage: 30

  },
  variants: {
    resultsPerPage: 30
  }


}