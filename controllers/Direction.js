import axios from 'axios'
import { getCache, setCache } from '../models/doscgModel'

export default class Direction
{
  async getSolution(req, res){
    let result = await getCache('getDirection')
    if(!result){
      console.log('get real process')
      result = await axios.get ('https://maps.googleapis.com/maps/api/directions/json', {
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
            return result
          } else {
            return {
              status: false,
              error: 'Api key not valid'
            }
          }
        })
        .catch(function (error) {
          return{
            status: false,
            error: 'Something went wrong!'
          }
          console.log({error});
        })
      if (result.status ){
        setCache('getDirection', result)
      }
    }else{
      console.log('get cache')
    }
    return result
  }
}
