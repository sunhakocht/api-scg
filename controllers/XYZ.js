import { reduce } from 'lodash'
import { getCache, setCache } from '../models/doscgModel'

export default class XYZ
{
  async getSolution(){
    const $this = this
    let result = await getCache('getXYZ')
    if(!result){
      console.log('get real process')
      result = this.computeQuadratic()
      setCache('getXYZ', result)
    }else{
      console.log('get cache')
    }
    console.log({ result })
    return result
  }
  computeQuadratic() {
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
    return { status: true, question: ' Given x,y,5,9,15,23,z. Find x, y and z.', answer: { x, y, z}}
  }
}
