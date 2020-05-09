import { reduce } from 'lodash'
import { client, getCache, setCache } from '../models/doscgModel'
import axios from 'axios'
import  crypto  from 'crypto'

const computeQuadratic = () => {
  let x,y,z
  const sequence = [ 5, 9, 15, 23 ]
  const getNTerm = ( a = 0, b = 0, c = 0, n = 1) => (a*(Math.pow(n, 2))) + (b*n) + c;
  const firstDiff = reduce(sequence, (carry, item, key)=>{
    if (item === undefined || sequence[key+1] === undefined) return carry
    return [...carry, sequence[key+1] - item]
  }, [])
  const secondDiff = reduce(firstDiff, (carry, item, key)=>{
    if (item === undefined || firstDiff[key+1] === undefined) return carry
    return [...carry, firstDiff[key+1] - item]
  }, [])
  if ( !(secondDiff.every( (val, i, arr) => val === arr[0] ))) {
    return { status: false, error: 'cannot handle this kind of sequence'}
  }

  const a = secondDiff[0]/2
  const b = sequence[1] - sequence[0] - (3*a)
  const c = sequence[0] - a - b

  x = getNTerm(a, b, c, -1)
  y = getNTerm(a, b, c, 0)
  z = getNTerm(a, b, c, 5)
  const result = { status: true, question: ' Given x,y,5,9,15,23,z. Find x, y and z.', answer: { x, y, z}}
  client.set('getXYZ', JSON.stringify(result))

  return result
}

const getXYZ = (req, res) => {
  client.get("getXYZ", function(err, reply) {
    if ( reply !== null){
      console.log('get from cache')
      getCache('getXYZ').then( resolved => {
        res.send(JSON.parse(resolved[0]))
      })
    }else{
      console.log('get real process')
      const result = computeQuadratic()
      setCache('getXYZ', result)
      res.send(result)
    }
  });
}

const getBC = (req, res) => {
  client.get("getBC", function(err, reply) {
    if ( reply !== null){
      console.log('get from cache')
      getCache('getBC').then( resolved => {
        res.send(JSON.parse(resolved[0]))
      })
    }else{
      console.log('get real process')
      const A = 21
      const B = 23 - A
      const C = -21 - A
      const result = { status: true, question: ' Given A = 21, A + B = 23 and A + C = -21. Find B and C.', answer: { B, C}}
      setCache('getBC', result)
      res.send(result)
    }
  });
}

const getBestDirectionFromSCGToCentralWorld = (req, res) => {
  client.get("getDirection", function(err, reply) {
    if ( reply !== null){
      console.log('get from cache')
      getCache('getDirection').then( resolved => {
        res.send(JSON.parse(resolved[0]))
      })
    }else{
      console.log('get real process')
      axios.get ('https://maps.googleapis.com/maps/api/directions/json', {
        params: {
          origin: '13.8058793,100.535343',
          destination: '13.7466304,100.5371464',
          key: "", //make sure to add key
        }
      })
        .then(function (response) {
          if (response.data.status === 'OK') {
            const result = {
              status: true,
              question: 'Use google map api to find a best route from SCG Bangsue to Central World.',
              answer: {
                geocoded_waypoints: response.data.geocoded_waypoints,
                routes: response.data.routes,
              }
            }
            setCache('getDirection', result)
            res.send(result)
          } else {
            res.send({
              status: false,
              error: 'Api key not valid'
            })
          }
        })
        .catch(function (error) {
          res.send({
            status: false,
            error: 'Something went wrong!'
          })
          console.log({error});
        })
    }
  });
}

const pushMessage = (to, messages) => {
  axios.post('https://api.line.me/v2/bot/message/push', {
    to,
    messages
  }, {
    headers: {
      Authorization: 'Bearer HtVoqlePjARJttxCHFyfi+jWoJUrnotuJm6mo1P9YxS56tRWPeh9VSrKDH4wMVFEVdzkHEpTm+Xo0Q+udmgVGbvSnVL0yFE111Cm47OW6AhmWzoYw/5SvNj9gCFoou01pIe92dOTiIrHsRJoVkDZ6QdB04t89/1O/w1cDnyilFU=',
      'Content-Type': 'application/json'
    },
  })
    .then(function (response) {
      if(response.status !== 200){
        console.log( response.statusText )
      }
    })
}

const replyMessage = (replyToken, messages) => {
  axios.post('https://api.line.me/v2/bot/message/reply', {
    replyToken,
    messages
  }, {
    headers: {
      Authorization: 'Bearer HtVoqlePjARJttxCHFyfi+jWoJUrnotuJm6mo1P9YxS56tRWPeh9VSrKDH4wMVFEVdzkHEpTm+Xo0Q+udmgVGbvSnVL0yFE111Cm47OW6AhmWzoYw/5SvNj9gCFoou01pIe92dOTiIrHsRJoVkDZ6QdB04t89/1O/w1cDnyilFU=',
      'Content-Type': 'application/json'
    },
  })
    .then(function (response) {
      if(response.status !== 200){
        pushMessage('Ua7903b1ec8ad59360b5046786ac2fe51', [
          {
            type: "text",
            text: `unable to reply to replyToken: ${replyToken}`
          },
        ] )
        console.log( response.statusText )
      }
    })
    .catch(function (error) {
      pushMessage('Ua7903b1ec8ad59360b5046786ac2fe51', [
        {
          type: "text",
          text: `unable to reply to replyToken: ${replyToken}`
        },
      ] )
    console.log({error});
  })
}

const lineMessaging = (req, res) => {
  const channelSecret = '86d5b5eab1d8903afd26299bbf6894b3'
  const body = JSON.stringify(req.body); // Request body string
  const signature = crypto
    .createHmac('SHA256', channelSecret)
    .update(body).digest('base64');
  if(signature !== req.headers['x-line-signature']){
    console.log({ error: 'signature fail'})
  }
  const datetime = new Date(req.body.events[0].timestamp);
  const replyToken = req.body.events[0].replyToken
  const { type } = req.body.events[0].message
  const notificationObjectId = setTimeout(()=> {
    pushMessage('Ua7903b1ec8ad59360b5046786ac2fe51',
      [
        {
          type: "text",
          text: `unable to reply to replyToken: ${replyToken}`
        },
      ]
    )
  }, 10000)
  if ( type === 'text' ){
    clearTimeout(notificationObjectId);
    replyMessage(replyToken, [
      {
        type: "text",
        text: "Nice talking with you"
      },
    ])
    res.send('OK')
  }
}
export {
  getXYZ,
  getBC,
  getBestDirectionFromSCGToCentralWorld,
  lineMessaging
}
