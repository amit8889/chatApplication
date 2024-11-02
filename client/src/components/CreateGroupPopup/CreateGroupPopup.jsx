import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
  Paper,
} from "@mui/material";
import { getAllLiveUser } from "../../services/api.js";
import styles from "./CreateGroupPopup.module.css";

const CreateGroupPopup = ({
  setIsCreateGrpPopupOpen,
  accessToken,
  handleGroupCreation,
}) => {
  const [groupData, setGroupData] = useState([]);
  const [groupName, setGroupname] = useState("");
  const [selectUser, setSelectedUser] = useState([]);

  const liveUser = async () => {
    const users = await getAllLiveUser(accessToken);
    setGroupData(users?.data || []);
  };

  useEffect(() => {
    if (accessToken) {
      liveUser();
    }
  }, [accessToken]);

  const handleCreateGroup = () => {
    if (!groupName?.trim() || selectUser.length === 0) {
      alert("Please select users and enter group name");
      return;
    }
    handleGroupCreation(groupName, selectUser);
    setIsCreateGrpPopupOpen(false);
  };

  const handleChange = (e, user) => {
    if (e.target.checked) {
      setSelectedUser([...selectUser, user.email]);
    } else {
      const data = selectUser.filter((val) => val !== user.email);
      setSelectedUser(data);
    }
  };

  return (
    <Box
      className={styles.container}
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <Paper
        className={styles.popup}
        elevation={3}
        sx={{ padding: 2, width: "300px", maxWidth: "80%" }}
      >
        <Typography variant="h6" gutterBottom>
          Create Group
        </Typography>
        <TextField
          type="text"
          name="groupName"
          id="group-name-input"
          value={groupName}
          placeholder="Enter group name..."
          onChange={(e) => {console.log("eee"+e);setGroupname(e.target.value)}}
          fullWidth
          onClick={(e) => {console.log("===");}}
          margin="normal"
          inputProps={{ style: { fontSize: "16px" } }}
        />
        {groupData &&
          Array.isArray(groupData) &&
          groupData.map((user, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  onChange={(e) => handleChange(e, user)}
                  checked={selectUser.includes(user.email)}
                />
              }
              label={user.name}
            />
          ))}
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button
            variant="outlined"
            onClick={() => setIsCreateGrpPopupOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateGroup}
            sx={{ backgroundColor: "#007bff", color: "white" }}
          >
            Create Group
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateGroupPopup;
