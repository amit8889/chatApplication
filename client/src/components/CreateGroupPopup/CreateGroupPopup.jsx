import React, { useEffect, useState } from 'react';
import styles from './CreateGroupPopup.module.css';
import {getAllLiveUser} from "../../services/api.js"
const CreateGroupPopup = ({ setIsCreateGrpPopupOpen,accessToken,handleGroupCreation }) => {
    const [groupData, setGroupData] = useState([]);
    const [groupName,setGroupname] = useState(null)
    const [selectUser, setSelectedUser] = useState([]);
    const liveUser = async()=>{
      const users =  await getAllLiveUser(accessToken)
      setGroupData(users?.data || [])
    }
    useEffect(() => {
        if(accessToken){
            liveUser()
        }
    }, []);
    const handleCreateGroup = () => {
        // call func to handle group
        if(!groupName?.trim() || selectUser?.length==0){
            alert('Please select users and entre group name')
            return;
        }
        handleGroupCreation(groupName,selectUser)
        setIsCreateGrpPopupOpen(false);
        
    }

    const handleChange = (e,user,index) => {
        if (e.target.checked) {
            setSelectedUser([...selectUser, user.email]);
        }else{
            // remove uncheked user
            const data = selectUser.filter(val=>val!=user.email)
            setSelectedUser(data)
        }
        
        
    }
    return (
        <div className={styles.container}>
            <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
                <input
                    type="text"
                    name="groupName"
                    value = {groupName}
                    placeholder="Enter group name..."
                    onChange={(e) => setGroupname(e.target.value
                    )}
                    className={styles.searchInput}
                />
               { groupData &&Array.isArray(groupData)&& groupData.map((user, index) => (
                    <div
                        key={index}
                        className={styles.resultItem}
                    >
                        <input
                            type='checkbox'                           
                            onChange={(e) => handleChange(e,user,index)}                            
                        /><label>{user.name}</label>
                    </div>

                ))}
                <div className={styles.creategroupbutton}>
                    <button className={styles.btn} onClick={e => setIsCreateGrpPopupOpen(false)}>Cancel</button>
                    <button className={styles.btn} style={{ backgroundColor: '#007bff' }} onClick={e => handleCreateGroup()}>Create Group</button>
                </div>
            </div>
        </div>


    );
};

export default CreateGroupPopup;
