import React, { useState, useRef } from 'react';
import { TextField, List, ListItem, ListItemText, IconButton, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getSocketInstance } from '../../services/websocket.js';
import styles from './Sidebar.module.css';

function Sidebar({ usersAndRoom, onUserAndRoomSelect, setSearchResult, selectedUser, setIsCreateGrpPopupOpen }) {
    const debounceRef = useRef(null);

    const handleSearch = (data) => {
        const socket = getSocketInstance();
        if (socket && data) {
            socket.emit("searchUser", data);
        } else {
            setSearchResult(null);
        }
    };

    const debounceSearch = (search, cb, timer) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => { cb(search); }, timer);
    };

    return (
        <Paper className={styles.sidebar} elevation={3}>
            <TextField
                variant="outlined"
                placeholder="Search users..."
                onChange={(e) => debounceSearch(e.target.value, handleSearch, 1000)}
                fullWidth
                className={styles.searchInput}
            />
            <List className={styles.userList}>
                {usersAndRoom && Array.isArray(usersAndRoom) && usersAndRoom.length > 0 && usersAndRoom.map((data, index) => (
                    <ListItem
                        button
                        key={index}
                        onClick={() => onUserAndRoomSelect(data)}
                        selected={(selectedUser?.email || selectedUser?.roomName) === (data.email || data.roomName)}
                        className={styles.userItem}
                    >
                        <ListItemText
                            primary={data?.name ? data.name : data.roomName}
                            secondary={
                                data?.name 
                                    ? `${data.name.substring(0, 10)} 👤` 
                                    : `${data.roomName.substring(0, 10)} 👨‍👩‍👧‍👦`
                            }
                        />
                    </ListItem>
                ))}
            </List>
            <IconButton
                color="primary"
                onClick={() => setIsCreateGrpPopupOpen(true)}
                className={styles.createGroupBtn}
            >
                <AddIcon />
            </IconButton>
        </Paper>
    );
}

export default Sidebar;
