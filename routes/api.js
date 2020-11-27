const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send(JSON.stringify({value:'respond with a resource'}));
});

module.exports = router;
