import express from 'express';
import bodyParser from 'body-parser';
import 'regenerator-runtime/runtime'
import { DoSCG } from './controllers/doscgController'
import LineBot from './controllers/LineBot'

const app = express()
const port = 3000

console.log(process.env.NODE_ENV)
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:8080"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.get('/', (req, res) => res.send('Welcome to Sunhakoch assignment api'))
const doSCG = new DoSCG()
app.get('/getXYZ', async (req, res) => {
  const question = doSCG.getDoSCG('XYZ')
  question.a()
  if (question === null){
    res.status(401).send('unable to find the question')
    return
  }
  res.send(await question.getSolution())
});
app.get('/getBC', async (req, res) => {
  const question = doSCG.getDoSCG('BC')
  if (question === null){
    res.status(401).send('unable to find the question')
    return
  }
  res.send(await question.getSolution())
});
app.get('/getDirection', async (req, res) => {
  const question = doSCG.getDoSCG('direction')
  if (question === null){
    res.status(401).send('unable to find the question')
    return
  }
  res.send(await question.getSolution())
});
app.post('/doscgWebHook', async (req, res) => {
  const lineBot = new LineBot(req)
  if( lineBot.error.length > 0){
    const errorString = lineBot.error.join(', ')
    res.send(errorString)
    return
  }
  const replyToken = req.body.events[0].replyToken
  const { type } = req.body.events[0].message
  const notificationObjectId = setTimeout(()=> {
    lineBot.addMessage = {
      type: "text",
      text: `unable to reply to replyToken: ${replyToken}`
    }
    lineBot.receiver = lineBot.adminId
    lineBot.pushMessage()
  }, 10000)
  if ( type === 'text' ){
    clearTimeout(notificationObjectId);
    lineBot.cleanMessages = 'ALL'
    lineBot.replyToken = replyToken
    lineBot.addMessage = {
      type: "text",
      text: "Nice talking with you"
    }
    const replyMsgRes = await lineBot.replyMessage()
    if (!replyMsgRes.status && replyMsgRes.type === 'RESPONSE'){
      lineBot.cleanMessages = 'ALL'
      lineBot.addMessage = {
        type: "text",
        text: `unable to reply to replyToken: ${replyToken}`
      }
      lineBot.receiver = lineBot.adminId
      await lineBot.pushMessage()
    }
    res.send('OK')
  }
});


app.listen(port, () => console.log(`DoSCG API listening at http://localhost:${port}`))
