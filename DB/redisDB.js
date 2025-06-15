import {createClient} from 'redis'

const redisClient = createClient()

export default redisClient

export const ConnectRedis = async()=>{
    try {
      const client = await redisClient.connect()
      return client
    } catch (error) {
        console.log("error while connecting to redis", error)
    }
}

process.on("SIGINT", async()=>{
    try {
        await redisClient.quit()
    } catch (error) {
        console.log("error while quit the redis client", error)
    }
})