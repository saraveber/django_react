import React, { createContext, useState, useEffect, useContext } from 'react';
import { USER_KEY } from "../constants";
import { useLocation } from 'react-router-dom';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [currUser, setCurrUser] = useState({});
  const [authorised, setAuthorised] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const getProfile = async () => {
      const userKey = localStorage.getItem(USER_KEY); // Replace 'USER_KEY' with your actual key
      if (userKey) {
        const user = JSON.parse(userKey);
        setCurrUser(user);
        setRole(user.group_names[0]); // Assuming the role is stored in group_names[0]
        setAuthorised(true);
      } else {
        setCurrUser(null);
        setRole(null);
        setAuthorised(false);
      }
    };

    getProfile();
  }, [location.pathname]);

  return (
    <UserContext.Provider value={{ role, setRole, currUser, setCurrUser, authorised ,setAuthorised}}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);