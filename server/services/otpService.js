const crypto = require('crypto');
const Email = require('../utils/sendEmail')
class OtpService{
    async generateOtp(){
        const otp= crypto.randomInt(1000,9999);
        return otp;
    }
    async hashOtp(data){
        return  crypto.createHmac('sha256',process.env.Hash_SECRET).update(data).digest('hex')
    }
    async sendOtpByEmail(email,otp,expireTime){
        const options = {
            email: email,
            subject: "OTP Verification for Chat App",
            message: `Your OTP for the Chat App is ${otp}. It is valid for ${expireTime} minutes. Please use it to verify your account.`
        };
        
        await Email.sendEmail(options)
    }
    async VerifyOtp(hashotp,otp){
       const opt_hash= await this.hashOtp(otp);
       return opt_hash==hashotp;
    }
}

module.exports = new OtpService();