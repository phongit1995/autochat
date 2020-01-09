let express = require('express');
let router = express.Router();
let schedule = require('node-schedule');
let { playGame} = require('./../../controllers/admin/game');
schedule.scheduleJob('*/5 * * * * *', async function(){
    await playGame();
});

module.exports = router ;