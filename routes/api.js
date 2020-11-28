const express = require('express');
const router = express.Router();
const QoL = require('./libs/QoLCalc').processQoL;
const samplePatients = require('./libs/QoLCalc').GetSamplePatients;

const handleResponse = (patientID, res) => {

  Promise.all([QoL(patientID), samplePatients()]).then(values => {
    let qolData = values[0], sampleP = values[1]

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

    res.header("Content-Type",'application/json');
    res.json({
      title: 'QoL',
      title2: 'Factor weights for score',
      pieData: chart1,
      pieData2: chart2,
      qualityOfLifeData: qolData,
      samplePatients: sampleP
    })
    // res.send(JSON.stringify({
    //   title: 'QoL',
    //   title2: 'Factor weights for score',
    //   pieData: chart1,
    //   pieData2: chart2,
    //   qualityOfLifeData: qolData,
    //   samplePatients: sampleP
    // }), null, 2);
  });
}

/* GET users listing. */
router.get('/', (req, res, next) => {
  handleResponse(undefined, res)
});
router.get('/patient/:patientID', (req, res, next) => {
  handleResponse(req.params.patientID, res)
});

module.exports = router;
