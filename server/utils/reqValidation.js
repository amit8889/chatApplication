const joi = require('joi')


const userSchema = {
    userRegister:Joi.object({
        name:Joi.string().required(),
        email:Joi.string().email().required(),
        
    })
}