import axios from 'axios';

const URL='http://localhost:7000'
export const requestOtp=async(email)=> {
    try{
        const res=await axios.post(`${URL}/user/sendOtp`,{email});
        return res?.data
    }catch(error){
        console.log(error);
    }    
  }
  
  export const verifyOtp= async(data)=>{
    try{
        const res=await axios.post(`${URL}/user/verifyOtp`,data);
        return res?.data
    }catch(error){
        console.log(error);
    }   
  }