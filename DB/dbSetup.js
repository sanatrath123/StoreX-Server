import { Db, MongoClient, ObjectId } from "mongodb";
import { connectDB,client } from "./db.js";


const db = await connectDB()
//const command = 'collMod'
const command = 'create'
try {
    //create user collection schema
const userCollection =await  db.command({
    [command]:"userDB" , 
    validator:{
      $jsonSchema: {
        required: [
          'name',
          'email',
          'password',
          'rootDirID'
        ],
        properties: {
          _id: {
            bsonType: 'objectId',
            description: 'invalid id'
          },
          name: {
            bsonType: 'string',
            description: 'invalid name',
            minimum: 4
          },
          password: {
            bsonType: 'string',
            minimum: 5,
            description: 'invalid password'
          },
          email: {
            bsonType: 'string',
            description: 'invalid email'
          },
          rootDirID: {
            bsonType: 'objectId',
            description: 'invalid rootdirId'
          }
        },
        additionalProperties: false
      }
      },
      
      validationLevel:"strict",
      validationAction:"error"
}
)

//directory collection 
const directoryCollection =await  db.command({
  [command]:"directoryDB" , 
    validator:{
      $jsonSchema: {
        required: [
          'name',
          'userId',
          'parent'
        ],
        properties: {
          _id: {
            bsonType: 'objectId',
            description: 'invalid id'
          },
          name: {
            bsonType: 'string',
            description: 'invalid name'
          },
          userId: {
            bsonType: 'objectId',
            description: 'invalid userid'
          },
          parent: {
            bsonType: [
              'objectId',
              'null'
            ],
            description: 'invalid parent user id'
          }
        },
        additionalProperties: false
      }
    },
      
      validationLevel:"strict",
      validationAction:"error"
}
)

//file collection
const fileCollection =await  db.command({
  [command]:"fileDB" , 
    validator:{
      $jsonSchema: {
        required: [
          'name',
          'extension',
          'parent'
        ],
        properties: {
          _id: {
            bsonType: 'objectId'
          },
          name: {
            bsonType: 'string',
            description: 'invalid name'
          },
          extension: {
            bsonType: 'string',
            description: 'invalid extension'
          },
          parent: {
            bsonType: 'objectId',
            description: 'invalid parentId'
          }
        },
        additionalProperties: false
      }
    
      },
      
      validationLevel:"strict",
      validationAction:"error"
}
)
} catch (error) {
    console.log("error while setting schema in db",error)
}finally{
    await client.close()
}

