const jwt  = require('jsonwebtoken');

const accesstokensecreat=process.env.ACCESS_TOKEN_SECRET;

class TokenService{ 
    generateToken(payload){
        const accessToken =jwt.sign(payload,accesstokensecreat,{expiresIn:process.env.ACCESS_TOKEN_EXPIREIN})
         return {accessToken};
    }
   //verify access token
     verifyAccessToken(token)
    {  
        return  jwt.verify(token,accesstokensecreat);
    }

}


module.exports= new TokenService();