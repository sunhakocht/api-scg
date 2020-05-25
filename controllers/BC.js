import { getCache, setCache } from '../models/doscgModel'

export default class BC
{
  async getSolution(){
    let result = await getCache('getBC')
    if(!result){
      console.log('get real process')
      const A = 21
      const B = 23 - A
      const C = -21 - A
      result = { status: true, question: ' Given A = 21, A + B = 23 and A + C = -21. Find B and C.', answer: { B, C}}
      setCache('getBC', result)
    }else{
      console.log('get cache')
    }
    return result
  }
}
