


//currently working
- change the schema validation inside dbSetup.js it gives a namespace error after adding the role field
- delete the user route with soft delete


//ERRORS TO FIX 
-userDb setup when i run that file it gives a error "node DB/dbSetup.js 
error while setting schema in db MongoServerError: namespace Storage.userDB already exists, but with different opt
ions: { uuid: UUID("53e1b915-9656-40bc-af82-a55f6041d143"), validationLevel: "strict", validationAction: "error" }
    at Connection.sendCommand (C:\Users\91832\major-projects\StoreX-Server\node_modules\mongodb\lib\cmap\connectio
n.js:298:27)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async Connection.command (C:\Users\91832\major-projects\StoreX-Server\node_modules\mongodb\lib\cmap\connect
ion.js:326:26)
    at async Server.command (C:\Users\91832\major-projects\StoreX-Server\node_modules\mongodb\lib\sdam\server.js:1
67:29)
    at async RunCommandOperation.execute (C:\Users\91832\major-projects\StoreX-Server\node_modules\mongodb\lib\ope
rations\run_command.js:19:21)
    at async tryOperation (C:\Users\91832\major-projects\StoreX-Server\node_modules\mongodb\lib\operations\execute
_operation.js:207:20)
    at async executeOperation (C:\Users\91832\major-projects\StoreX-Server\node_modules\mongodb\lib\operations\exe
cute_operation.js:75:16)
    at async Db.command (C:\Users\91832\major-projects\StoreX-Server\node_modules\mongodb\lib\db.js:189:16)       
    at async file:///C:/Users/91832/major-projects/StoreX-Server/DB/dbSetup.js:10:23 {
  errorLabelSet: Set(0) {},
  errorResponse: {
    ok: 0,
    errmsg: 'namespace Storage.userDB already exists, but with different options: { uuid: UUID("53e1b915-9656-40bc
-af82-a55f6041d143"), validationLevel: "strict", validationAction: "error" }',
    code: 48,
    codeName: 'NamespaceExists',
    '$clusterTime': {
      clusterTime: new Timestamp({ t: 1749326309, i: 1 }),
      signature: [Object]
    },
    operationTime: new Timestamp({ t: 1749326309, i: 1 })
  },
  ok: 0,
  code: 48,
  codeName: 'NamespaceExists',
  '$clusterTime': {
    clusterTime: new Timestamp({ t: 1749326309, i: 1 }),
    signature: {
      hash: Binary.createFromBase64('ACGcy0RKDH2i+wzRGbx9xsCFboU=', 0),
      keyId: new Long('7476669860466917383')
    }
  },
  operationTime: new Timestamp({ t: 1749326309, i: 1 })" 
//the past schema how to set that "{
  $jsonSchema: {
    required: [
      'name',
      'email',
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
        minLength: 3
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
    additionalProperties: true
  }
}"



//feature to build
- make it a public folder and share with specific user
#implement the googleOauth for sing up and login //done
#implement the sessions inside the auth section and also with jwt 

#implement aggregation pipeline

#implemnt 2nd server in my laptop for serving files like imgs and mp4

#fetch the users google drive data

#set the limit on the storage for the user

#create a public and private folder and implement the share fetures 

#show the directory details like total size of the directory and how many files inside that directory, by using redis caching , this is usecase to show computed data vai cacheing