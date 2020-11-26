const axios = require('axios');

// axios.get('https://rxnav.nlm.nih.gov/REST/json', {
//     params: {
//         //ID: 12345
//     }
// })
//     .then(function (response) {
//         console.log(response.data.resourceList.resource);
//     })
//     .catch(function (error) {
//         console.log(error);
//     })
//     .then(function () {
//         // always executed
//     });

// http://hapi.fhir.org/baseR4/Condition?patient=1265109&_include=*&_pretty=true

/**
 * Citation: https://stackoverflow.com/a/7091965/5398884
 * @param dateString {string}
 * @returns {number}
 */
function getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

let QoL_score = {
    endScore: 10,
    measurements: {
        numberOfConditions: {
            total: 0,
            24484000: {code: 24484000, count: 0, name: "Severe"},
            6736007: {code: 6736007, count: 0, name: "Moderate"},
            255604002: {code: 255604002, count: 0, name: "Mild"},
        },
        age: [
            {ding: 1, upper: 100, lower: 85},
            {ding: 1.5, upper: 84, lower: 70},
            {ding: 1.75, upper: 69, lower: 50},
            {ding: 1.75, upper: 49, lower: 38},
        ],
        yearsOfCondition: []
    }
};

const updateSeverity = (severity) => {
    QoL_score.measurements.numberOfConditions[severity.coding[0].code] += 1;
}
const updateTotal = (bundle) => {
    QoL_score.measurements.numberOfConditions.total = bundle.total
}

const addYearsOfCondition = (entry) => {
    let age = getAge(entry.find(element => element.resource.resourceType === "Patient").resource.birthDate);
    for (let obj of entry) {
        if(obj.resource.resourceType === "Condition"){
            if((age - obj.resource.onsetAge.value) > 0){
                QoL_score.measurements.yearsOfCondition.push(age - obj.resource.onsetAge.value)
            }
        }
    }
}

axios.get('http://hapi.fhir.org/baseR4/Condition', {
    params: {
        patient: 1265109,
        //_include: "*",
        _pretty: true
    }
})
    .then(function (response) {
        console.log(JSON.stringify(response.data, null, 2));

    })
    .catch(function (error) {
        console.log(error);
    })
    .then(function () {
        // always executed
    });