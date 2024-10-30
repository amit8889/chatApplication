
const OtpServices = require('../services/otpService')
const TokenService = require('../services/tokenService')
const sendOtp = async(req,res)=>{
    try {
        const {email} = req.body;
        if(!email){
            return res.status(400).json({success:false,message:"Email is required"});
        }
        const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({success:false,message:"Invalid email"});
        }
        const otp = await OtpServices.generateOtp();
        // set otp expiery in minutes
        const expireTime = process.env.OTP_EXPIRE_TIME;
        const ttl = expireTime*1000 * 60;
        const expire = new Date().getTime() + ttl;
        const hash = await OtpServices.hashOtp(otp+"");
        const data = `${hash}.${expire}`

        //send otp by sms
        await  OtpServices.sendOtpByEmail(email,otp,expireTime);
        res.status(200).json({
            success:true,
            message:"Otp send successfully!!",
            hash:data
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const verifyOtp = async (req, res) => {
    try {
        const { email,name, otp, hash } = req.body;
         if (!email || !otp || !hash || !name) {
            return res.status(400).json({ success: false, message: "Email,otp,name and hash is required"});
        } 
        const [hashotp, expire] = hash.split('.');
        if (Date.now() > expire) {
            return res.status(400).json({ success: false, message: "Otp expired!!"});
        }
        const verify = await OtpServices.VerifyOtp(hashotp, otp);
        if(!verify){
            return res.status(400).json({ success: false, message: "Invalid otp!!"});
        }
       const { accessToken } = TokenService.generateToken({email,name});
        res.status(201).json({
            message:"Otp verified!!",
            success: true,
            accessToken
        })
    }
    catch (error) {
       res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports = {sendOtp,verifyOtp}
