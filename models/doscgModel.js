import redis from 'redis'
import bluebird from 'bluebird'

const client = redis.createClient(process.env.REDIS_URL);
bluebird.promisifyAll(redis.RedisClient.prototype);
client.on('reconnecting', console.log.bind(console));

// Listen to errors
client.on('error', (err) => {
  if (err.message.indexOf('ECONNREFUSED') > -1) {
    console.log('Connection refused, should retry');
    return;
  }

  throw err;
});

const getCache = key => {
  const promise = client.getAsync(key).then(function(reply) {
    return reply;
  });
  return Promise.all([promise]);
}

const setCache = (key, result) => client.set(key, JSON.stringify(result), 'EX', 60 * 5)

export {
  getCache,
  setCache,
  client
}
