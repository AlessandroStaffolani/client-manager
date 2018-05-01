/**
 *Module dependencies
 */

const express = require('express');
const apiDataController = require('../controller/apiDataController');

//==============================================================================

/**
 *Create router instance
 */

const router = express.Router();

//==============================================================================

/**
 *Routes
 */

/* GET home page. */
router.get('/', apiDataController.index);

router.get('/get/data/headers', apiDataController.get_data_headers)

router.get('/get/data', apiDataController.data_get);

router.post('/post/data', apiDataController.data_post);

router.get('/google/place/data', apiDataController.place_data_put)

module.exports = router;
