// validate token
const {verifyAccessToken} = require('../services/tokenService')
function validate(req, res, next) {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      
      if (token) {
        const isValid = verifyAccessToken(token);
        if (isValid) {
            req.user = {email:isValid.email}
            console.log("====00")
            console.log(req.user)
          return next();
        }
      }
  
      res.status(401).json({
        message: "Invalid or missing token",
        success: false
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
        success: false
      });
    }
  }
  
  module.exports ={validate}