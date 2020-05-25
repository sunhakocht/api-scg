import axios from 'axios'
import crypto from "crypto"

export default class LineBot
{
  constructor(req){
    this.receiver = ''
    this.messages = []
    this.replyToken = ''
    this.adminId = 'Ua7903b1ec8ad59360b5046786ac2fe51'
    this.error = []
    const channelSecret = '86d5b5eab1d8903afd26299bbf6894b3'
    const body = JSON.stringify(req.body); // Request body string
    const signature = crypto
      .createHmac('SHA256', channelSecret)
      .update(body).digest('base64');
    if(signature !== req.headers['x-line-signature']){
      this.error.push('signature fail')
    }
  }

  set addMessage({type, text}){
    if (type !== 'text' || text.length < 1) return
    this.messages.push({type, text})
  }

  set setReceiver(id){
    if (id.length < 1) return
    this.receiver = id
  }

  set setReplyToken(token){
    if (token.length < 1) return
    this.replyToken = token
  }

  set cleanMessages(type){
    switch(type){
      case 'ALL':
        this.messages = []
        break;
      case 'POP':
      default:
        this.messages.pop()
        break;
    }
  }

  async replyMessage(){
    const replyToken = this.replyToken
    const messages = this.messages
    if (replyToken.length < 1 || messages.length < 1) return null
    const result = await axios.post('https://api.line.me/v2/bot/message/reply', {
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
          return {
            status: false,
            type: 'RESPONSE'
          }
        }
        return {
          status: true,
          type: 'RESPONSE'
        }
      })
      .catch(function (error) {
        return {
          status: false,
          type: 'ERROR'
        }
      })
    console.log({ replyMessage: result })
    return result
}

  async pushMessage(){
    const to = this.receiver
    const messages = this.messages
    if (to.length < 1 || messages.length < 1) return null
    const result = await axios.post('https://api.line.me/v2/bot/message/push', {
      to,
      messages
    }, {
      headers: {
        Authorization: 'Bearer HtVoqlePjARJttxCHFyfi+jWoJUrnotuJm6mo1P9YxS56tRWPeh9VSrKDH4wMVFEVdzkHEpTm+Xo0Q+udmgVGbvSnVL0yFE111Cm47OW6AhmWzoYw/5SvNj9gCFoou01pIe92dOTiIrHsRJoVkDZ6QdB04t89/1O/w1cDnyilFU=',
        'Content-Type': 'application/json'
      },
    })
      .then(function (response) {
        if(response.status === 200){
          return {
            status: true,
            type: 'RESPONSE'
          }
        }
        return {
          status: false,
          type: 'RESPONSE'
        }
      })
      .catch(function (error) {
        return {
          status: false,
          type: 'ERROR'
        }
      })
    console.log({ pushMessage: result })
    return result
  }
}
