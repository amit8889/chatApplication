
const liveUser = new Map();

const setLiveUser = async(name,email,socketId)=>{
    //set in map
    const key = `${name}_${email}`;
    liveUser.set(name_email,socketId);
}
const removeLiveUser = async(socketId)=>{
    // delete from map where socketId match in value
    liveUser.forEach((value,key)=>{
        if(value === socketId){
            liveUser.delete(key);
        }
    })
}

const searchLiveUser = async(search)=>{
    // search in map where key match with search
    


}

module.exports = {setLiveUser,removeLiveUser}