import {OAuth2Client} from 'google-auth-library'

const clientId ="392009902415-gvdoj3vbspivjsppdn7dvertbh4fp7br.apps.googleusercontent.com"
const client = new OAuth2Client({
    clientId:clientId ,redirectUri:"http://localhost:5173"
})


export const VarifyIdToken =async (token)=>{
try {
    const data =  await client.verifyIdToken({idToken:token, audience:clientId})
    return data.getPayload()

} catch (error) {
    console.log("error while varifying the id_token")
}
}

