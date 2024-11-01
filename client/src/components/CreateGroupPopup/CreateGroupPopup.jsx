import React, { useEffect, useState } from 'react';
import styles from './CreateGroupPopup.module.css';

const CreateGroupPopup = ({ setIsCreateGrpPopupOpen }) => {
    const [showUsers, setShowUsers] = useState(false);
    const [groupData, setGroupData] = useState([]);
    const [groupData1, setGroupData1] = useState([{ name: "abc", email: "abcd@gmail.com" },
    { name: "abc", email: "abcd@gmail.com" },
    { name: "abc", email: "abcd@gmail.com" }, { name: "abc", email: "abcd@gmail.com" }]);

    useEffect(() => {
        console.log(groupData)
    }, [groupData]);
    const handleShowUsers = () => {
        setShowUsers(!showUsers);
    }
    const handleCreateGroup = () => {
        setIsCreateGrpPopupOpen(false);
        setGroupData([]);
    }

    const handleChange = (e) => {

    }
    return (
        <div className={styles.container}>
            <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
                <input
                    type="text"
                    name="groupName"
                    placeholder="Enter group name..."
                    onChange={(e) => handleChange(e)}
                    className={styles.searchInput}
                />
                <input
                    type='text'
                    name='search'
                    placeholder="Search users..."
                    onChange={(e) => handleChange(e)}
                    className={styles.searchInput}
                />
                <div className={styles.showUser}>
                    <button className={styles.userBtn} onClick={e => handleShowUsers()}>{showUsers ? 'Hide...' : 'show...'}</button>
                </div>
                {showUsers && groupData1.map((user, index) => (
                    <div
                        key={index}
                        className={styles.resultItem}
                        onClick={() => {
                        }}
                    >
                        <input
                            type='checkbox'                           
                            onChange={(e) => handleChange(e)}                            
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
