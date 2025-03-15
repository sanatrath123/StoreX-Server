import { MongoClient, ObjectId } from "mongodb"


export const client = new MongoClient('mongodb://dev1:1234@localhost:27017/Storage?replicaSet=myReplicaSet')

export const connectDB= async ()=>{
    await client.connect()
 const db = client.db('Storage')
 return db
}

process.on("SIGINT" , async()=>{
    await client.close()
    console.log("db disconnected")
    process.exit()
})


// db.getCollectionInfos({name:"userDB"}).find({$nor:[{$jsonSchema:db.getCollectionInfos({name:"userDB"})[0].options.validator.$jsonSchema}]}