const express = require('express');
const router = express.Router();

let data = [
    ['QoL', 'Quality of Life Score'],
    ['severe problems', 8],
    ['Moderate problems', 2],
    ['Mild problems', 4],
    ['Overall QoL', 8],
    ['Number of Problems', 2]
]

let options = {'title':'Quality of Life Score', 'width':550, 'height':400}

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('index', {title: 'QoL', pie: data, options: options});
});



module.exports = router;
