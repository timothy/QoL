const express = require('express');
const QoL = require('./libs/QoLCalc').processQoL;
const samplePatients = require('./libs/QoLCalc').GetSamplePatients;
const router = express.Router();

let options = {'title': 'Quality of Life Score', 'width': 550, 'height': 400}

const handleResponse = (patientID, res) => {
    Promise.all([QoL(patientID), samplePatients()]).then(values => {
        let qolData = values[0], sampleP = values[1]

        if(patientID){
            for(let i in sampleP){
                if(sampleP.hasOwnProperty(i))
                sampleP[i] = sampleP[i].split('/')[1]
            }
        }

        let chart1 = [
            ['QoL', 'Quality of Life Score'],
            ['Health Impact', 100 - qolData.endScore],
            ['Quality of Life', qolData.endScore],
        ]

        let chart2 = [
            ['QoL', 'Explanation of QoL scoring'],
        ]

        if (qolData.hasOwnProperty("impact")) {
            for (let i in qolData.impact) {
                if (qolData.impact.hasOwnProperty(i)) {
                    const {value, desc} = qolData.impact[i];
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
            response: qolData,
            sampleP: sampleP
        });
    });
}

/* GET home page. */
router.get('/', (req, res, next) => {
    handleResponse(undefined, res)
});

router.get('/patient/:patientID', function (req, res) {
    handleResponse(req.params.patientID, res)
});


module.exports = router;
