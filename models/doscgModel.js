import asyncRedis from 'async-redis';

const client = asyncRedis.createClient(process.env.REDIS_URL);

client.on('reconnecting', console.log.bind(console));

// Listen to errors
client.on('error', (err) => {
  if (err.message.indexOf('ECONNREFUSED') > -1) {
    console.log('Connection refused, should retry');
    return;
  }

  throw err;
});

const getCache = async key => JSON.parse(await client.get(key))

const setCache = (key, result) => client.set(key, JSON.stringify(result), 'EX', 60 * 5)

export {
  getCache,
  setCache,
}
