import React, { useState ,useEffect} from 'react';
import { Box, Paper, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // Importing the close icon
import styles from './SeachPopUp.module.css'; // Your custom CSS module

const SearchPopUp = ({ searchResult, handleSearchUser }) => {
    const [showPopup, setShowPopup] = useState(false);
    useEffect(()=>{
      if(searchResult.length>0){
        setShowPopup(true)
      }else{
        setShowPopup(false)
      }
    },[searchResult])

    return (
        <div>
            {showPopup && searchResult?.length > 0 && (
                <div className={styles.popupOverlay} onClick={() => setShowPopup(false)}>
                    <Paper className={styles.popup} onClick={(e) => e.stopPropagation()}>
                        <IconButton className={styles.closeButton} onClick={() => setShowPopup(false)}>
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="h6" className={styles.title}>
                            Search Results
                        </Typography>
                        {searchResult.map((user, index) => (
                            <Box
                                key={index}
                                className={styles.resultItem}
                                onClick={() => {
                                    handleSearchUser(user);
                                    setShowPopup(false);
                                }}
                            >
                                <Typography variant="body1">{user.name}</Typography>
                            </Box>
                        ))}
                    </Paper>
                </div>
            )}
        </div>
    );
};

export default SearchPopUp;
