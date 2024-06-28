import React from 'react';
import styles from '../styles/UserSelectionDropDown.module.css'; // Adjust the path as necessary

function UserSelectionDropDown({ CurrUserId, users, handleUserChange }) {
    return (
        <div className={styles.dropdownContainer}>
          <div>
            <select 
              onChange={handleUserChange} 
              value={CurrUserId || ""} // Ensure this is controlled correctly
              className={styles.selectDropdown}
            >
                {/* Remove `selected` from here */}
                <option value="" disabled>Select User</option>
                {users.map((user) => (
                    <option key={user.id} value={user.id}>
                    {user.username}
                    </option>
                ))}
            </select>
          </div>
          <div />
        </div>
      );
    
}

export default UserSelectionDropDown;