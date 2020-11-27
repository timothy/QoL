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
const getAge = (dateString) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

let QoL_score = {
    endScore: 100,// The end QoL score. The score starts out at 100%. Each negative health impact will lower the score
    measurements: {
        numberOfConditions: {
            total: 0,// The more problems a person has the lower their QoL is
            24484000: {code: 24484000, count: 0, name: "Severe", totalYearsPersonHadCondition: 0},// Higher severity will reduce QoL greater than lower severity.
            6736007: {code: 6736007, count: 0, name: "Moderate", totalYearsPersonHadCondition: 0},
            255604002: {code: 255604002, count: 0, name: "Mild", totalYearsPersonHadCondition: 0},//totalYearsPersonHadCondition: This show accumulative years of all conditions with this severity. The longer the condition persists the greater the impact on QoL
        },
        age: [// Generally younger people have less illnesses. Younger people's QoL takes a bigger hit the more problems they have.
            {ding: 0, upper: 1000, lower: 85},
            {ding: 0.1, upper: 84, lower: 70},
            {ding: 0.2, upper: 69, lower: 50},
            {ding: 0.3, upper: 49, lower: 38},
            {ding: 0.4, upper: 37, lower: 26},
            {ding: 0.5, upper: 25, lower: 17},
            {ding: 0.6, upper: 16, lower: 8},
            {ding: 0.8, upper: 0, lower: 7}
        ]
    }
};
/**
 * bundle.entry[].resource.severity
 * @param code {number | string} The severity code e.g. 6736007
 */
const updateSeverity = (code) => {
    QoL_score.measurements.numberOfConditions[code].count += 1;
}

/**
 *
 * @param total {number}
 */
const updateTotal = (total) => {
    QoL_score.measurements.numberOfConditions.total = total
}

/**
 *
 * @param age {number}
 * @param onsetAge {number}
 * @param severity {string | number}
 */
const totalYearsPersonHadCondition = (severity, onsetAge, age) => {
    const defaultLength = .3
    if ((age - onsetAge) > 0) {// get the value of years a condition has lasted
        QoL_score.measurements.numberOfConditions[severity].totalYearsPersonHadCondition += (age - onsetAge)
    } else {//else either age or onsetAge does not make sense...
        QoL_score.measurements.numberOfConditions[severity].totalYearsPersonHadCondition += defaultLength
    }
}

/**
 *
 * @param age {number}
 * @returns {number}
 */
const getAgeDing = (age) => {
    return QoL_score.measurements.age.find(e => e.upper >= age && e.lower <= age).ding
}

/**
 *
 * @param age {number} age of the patient
 * @returns {object}
 */
const calcEndScore = (age) => {
    const safeDivide = (dividend, divisor) => (divisor === 0 || dividend === 0) ? 0 : dividend / divisor

    const all = {
        ageDing: getAgeDing(age),
        totalCon: safeDivide(QoL_score.measurements.numberOfConditions.total, 1000),
        svrCount: safeDivide(QoL_score.measurements.numberOfConditions["24484000"].count, 100), //Severe
        modCount: safeDivide(QoL_score.measurements.numberOfConditions["6736007"].count, 500), //Moderate
        mildCount: safeDivide(QoL_score.measurements.numberOfConditions["255604002"].count, 1000), //Mild
        svrTotal: safeDivide(QoL_score.measurements.numberOfConditions["24484000"].totalYearsPersonHadCondition, 100), //Severe
        modTotal: safeDivide(QoL_score.measurements.numberOfConditions["6736007"].totalYearsPersonHadCondition, 500), //Moderate
        mildTotal: safeDivide(QoL_score.measurements.numberOfConditions["255604002"].totalYearsPersonHadCondition, 1000) //Mild
    }

    all.sum = all.ageDing + all.totalCon + all.svrCount + all.modCount + all.mildCount + all.svrTotal + all.modTotal + all.mildTotal
    all.endScore = QoL_score.endScore / (1 + all.sum)

    let calcImpact = (num) => (100 / (1 + num))

    all.impact = {
        ageDingImpact: {value: calcImpact(all.totalCon + all.svrCount + all.modCount + all.mildCount + all.svrTotal + all.modTotal + all.mildTotal),desc: "Patients Age"},
        totalConImpact: {value: calcImpact(all.ageDing + all.svrCount + all.modCount + all.mildCount + all.svrTotal + all.modTotal + all.mildTotal),desc: "Total number of conditions"},
        svrCountImpact: {value: calcImpact(all.ageDing + all.totalCon + all.modCount + all.mildCount + all.svrTotal + all.modTotal + all.mildTotal),desc: "Number of severe problems"},
        modCountImpact: {value: calcImpact(all.ageDing + all.totalCon + all.svrCount + all.mildCount + all.svrTotal + all.modTotal + all.mildTotal),desc: "Number of moderate problems"},
        mildCountImpact: {value: calcImpact(all.ageDing + all.totalCon + all.svrCount + all.modCount + all.svrTotal + all.modTotal + all.mildTotal),desc: "Number of mild problems"},
        svrTotalImpact: {value: calcImpact(all.ageDing + all.totalCon + all.svrCount + all.modCount + all.mildCount + all.modTotal + all.mildTotal),desc: "Accumulative years of all severe conditions"},
        modTotalImpact: {value: calcImpact(all.ageDing + all.totalCon + all.svrCount + all.modCount + all.mildCount + all.svrTotal + all.mildTotal),desc: "Accumulative years of all moderate conditions"},
        mildTotalImpact: {value: calcImpact(all.ageDing + all.totalCon + all.svrCount + all.modCount + all.mildCount + all.svrTotal + all.modTotal),desc: "Accumulative years of all mild conditions"}
    }

    return all
}

const processQoL = async (patientID = 1265109) => {
    return axios.get('http://hapi.fhir.org/baseR4/Condition', {
        params: {
            patient: patientID,
            _include: "*",
            _pretty: true
        }
    }).then((response) => {
        //console.log(JSON.stringify(response.data, null, 2));
        let age = 0

        if (response.data.hasOwnProperty("entry") &&
            response.data.hasOwnProperty("total")) {
            age = getAge(response.data.entry.find(o => o.hasOwnProperty("resource") &&
                o.resource.hasOwnProperty("birthDate") &&
                o.resource.hasOwnProperty("resourceType") &&
                o.resource.resourceType === "Patient")
                .resource.birthDate)

            updateTotal(response.data.total)

            for (let obj of response.data.entry) {
                if (obj.hasOwnProperty("resource") &&
                    obj.resource.hasOwnProperty("resourceType")) {
                    if (obj.resource.resourceType === "Condition") {
                        if (obj.resource.hasOwnProperty("severity") &&
                            obj.resource.severity.hasOwnProperty("coding") &&
                            obj.resource.severity.coding[0].hasOwnProperty("code")) {
                            updateSeverity(obj.resource.severity.coding[0].code)

                            if (obj.resource.hasOwnProperty("onsetAge") &&
                                obj.resource.onsetAge.hasOwnProperty("value")) {
                                totalYearsPersonHadCondition(obj.resource.severity.coding[0].code, obj.resource.onsetAge.value, age)
                            }
                        }
                    }
                }
            }//end loop
        }


        // console.log(JSON.stringify(QoL_score, null, 2))
        console.log(calcEndScore(age))
        return calcEndScore(age)
    })
        .catch((error) => {
            console.log(error);
            //return error
        })
    // .then(() => {
    //     // always executed
    // });
}
module.exports = {processQoL: processQoL}