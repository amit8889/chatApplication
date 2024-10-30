const { getPool } = require("../connection/dbConnection");

const addLiveUser = async ({ name, email, status, socketId }) => {
  try {
    const pool = getPool();
    const query = `
            INSERT INTO liveUser (name, email, status, socketId)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE status = 'ONLINE'
        `;
    const data = [name, email, status, socketId];
    const [result] = await pool.query(query, data);
    if (result.affectedRows > 0) {
      console.log("one row inserted", result?.insertId);
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const removeLiveUser = async ({ email }) => {
  try {
    const pool = getPool();
    const query = `
            DELETE FROM liveUser 
            WHERE email = ?
        `;
    const data = [email];
    const [result] = await pool.query(query, data);
    if (result.affectedRows > 0) {
      console.log("one row deleted", result?.affectedRows);
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const getSocketIdsByEmail = async (email) => {
  try {
    const pool = getPool();
    const query = `
        SELECT socketId FROM liveUser
        WHERE email IN (?)
        AND status = "ONLINE"
        `;
    const data = [email];
    const [result] = await pool.query(query, data);
    if (result.length > 0) {
      console.log("one row found", result);
      return result[0].socketId;
    }
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};
const searchUser = async (search) => {
  try {
    const pool = getPool();
    const query = `
        SELECT name,email FROM liveUser
        WHERE status = "ONLINE"
        AND (email LIKE ? OR name LIKE ?)
    `;
    const data = [`%${search}%`,`%${search}%`];
    const [result] = await pool.query(query, data);
    if (result.length > 0) {
      return result;
    }
    return [];
  } catch (error) {
    console.log(error);
    return [];
  }
};

module.exports = { addLiveUser, removeLiveUser, getSocketIdsByEmail,searchUser };
