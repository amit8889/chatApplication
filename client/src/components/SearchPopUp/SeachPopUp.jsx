import React, { useState } from 'react';
import styles from './SeachPopUp.module.css'; // Assume you have a CSS module

const SearchPopup = ({ searchResult,handleSearchUser }) => {
  const [showPopup, setShowPopup] = useState(searchResult?true:false);

  return (
    <div>
      {showPopup && searchResult?.length > 0 && (
        <div className={styles.popupOverlay} onClick={() => setShowPopup(false)}>
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setShowPopup(false)}>X</button>
            <h2>Search Results</h2>
            {searchResult.map((user, index) => (
             <div 
             key={index} 
             className={styles.resultItem} 
             onClick={() => {
                 handleSearchUser(user);
                setShowPopup(false);
             }}
           >
             <p>{user.name}</p>
           </div>
           
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPopup;
