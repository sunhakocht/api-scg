import express from 'express';
import bodyParser from 'body-parser';
import 'regenerator-runtime/runtime'
import { getXYZ, getBC, getBestDirectionFromSCGToCentralWorld, lineMessaging } from './controllers/doscgController'

const app = express()
const port = 3000

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.get('/getXYZ', getXYZ);
app.get('/getBC', getBC);
app.get('/getDirection', getBestDirectionFromSCGToCentralWorld);
app.post('/doscgWebHook', lineMessaging);


app.listen(port, () => console.log(`DoSCG API listening at http://localhost:${port}`))
