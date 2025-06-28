import { createClient } from "redis";

const redisClient = createClient({
    password:'52141239@'
})

try {
    await redisClient.connect()
    try {
        await redisClient.ft.info('uidIndex')
        console.log("index already exist")
    } catch (error) {
        await redisClient.ft.create("uidIndex",{ "$.userId":{type:"TAG", AS:"userId"} },{
              ON: 'JSON', 
              PREFIX: 'user:'
            }) 
        console.log("new index created")
    }finally{
      await  redisClient.quit()
      process.exit()
    }

} catch (error) {
   console.log("error while connect to redis db", error) 
}