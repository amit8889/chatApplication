import React, { useState,useRef,useEffect } from 'react';
import styles from './Sidebar.module.css';
import {getSocketInstance} from '../../services/websocket.js'
function Sidebar({ usersAndRoom, onUserAndRoomSelect ,setSearchResult,selectedUser,setIsCreateGrpPopupOpen}) {
//  const [searchTerm, setSearchTerm] = useState('');
  const debounceRef = useRef(null)

  // const filteredUsers = users.filter((user) =>
  //   user.toLowerCase().includes(searchTerm.toLowerCase())
  // );
  const handleSearch = (data)=>{
    console.log("====data searc",data)
    const socket = getSocketInstance();
    if(socket && data){
      socket.emit("searchUser",data);
    }else{
      console.log("==")
      setSearchResult(null)
    }
    
  }
  useEffect(()=>{
    console.log(usersAndRoom)
  },[])
  const debounceSearch = (search, cb, timer) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => { cb(search); }, timer);
  };
  
  return (
    <div className={styles.sidebar}>
      <input
        type="text"
       
        placeholder="Search users..."
        onChange={(e) => debounceSearch(e.target.value,handleSearch,1000)}
        className={styles.searchInput}
      />
      <ul className={styles.userList}>
        {usersAndRoom && Array.isArray(usersAndRoom) && usersAndRoom.length>0 && usersAndRoom.map((data, index) => (
        <li 
        key={index} 
        onClick={() => onUserAndRoomSelect(data)} 
        style={{ backgroundColor: (selectedUser?.email || selectedUser?.roomName) === (data.email || data.roomName) ? 'green' : 'transparent' }} 
        className={styles.userItem}
      >
            <span className={styles.userName}>
              {data?.name ? data.name[0].toUpperCase() : data.roomName[0].toUpperCase()}
            </span>
            {
              data?.name 
                ? `${data.name.substring(0, 10)} 👤` 
                : `${data.roomName.substring(0, 10)} 👨‍👩‍👧‍👦`
            }

          </li>
        ))}
      </ul>
      <button 
      className={styles.createGroupBtn}
      onClick={e=>setIsCreateGrpPopupOpen(true)}
      >+</button>
    </div>
  );
}

export default Sidebar;
