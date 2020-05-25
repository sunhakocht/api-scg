import XYZ from './XYZ'
import BC from './BC'
import Direction from './Direction'

class DoSCG
{
  getDoSCG(question)
  {
    if(question === 'XYZ') return new XYZ()
    else if( question === 'BC' ) return new BC()
    else if( question === 'direction' ) return new Direction()
    return null
  }
}
export {
  DoSCG,
}
