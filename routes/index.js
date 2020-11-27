const express = require('express');
const QoL = require('./libs/QoLCalc').processQoL;
const router = express.Router();

let options = {'title': 'Quality of Life Score', 'width': 550, 'height': 400}

const handleResponse = (patientID, res) => {
    QoL(patientID).then((response) => {
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
}

/* GET home page. */
router.get('/', (req, res, next) => {
    handleResponse(undefined, res)
});

router.get('/patient/:patientID', function (req, res) {
    handleResponse(req.params.patientID, res)
});


module.exports = router;
