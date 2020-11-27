const express = require('express');
const QoL = require('./libs/QoLCalc').processQoL;
const router = express.Router();

QoL().then(function (response) {
    console.log(response);
});

let options = {'title': 'Quality of Life Score', 'width': 550, 'height': 400}

/* GET home page. */
router.get('/', (req, res, next) => {
    let chart1 = [
        ['QoL', 'Quality of Life Score'],
        ['Health Impact', 8],
        ['Quality of Life', 2],
    ]


    QoL().then((response) => {
        console.log("The Response went through -> ", response)

        let chart1 = [
            ['QoL', 'Quality of Life Score'],
            ['Health Impact', 100 - response.endScore],
            ['Quality of Life', response.endScore],
        ]

        let chart2 = [
            ['QoL', 'Explanation of QoL scoring'],
        ]

        if (response.hasOwnProperty("impact")) {
            for (let i in response.impact) {
                if (response.impact.hasOwnProperty(i)) {
                    const {value, desc} = response.impact[i];
                    chart2.push([desc, value])
                }
            }
        }

        res.render('index', {
            title: 'QoL',
            title2: 'Factor weights for score',
            pie: chart1,
            options: options,
            pie2: chart2,
            options2: options,
            response: response
        });
    })


});


module.exports = router;
