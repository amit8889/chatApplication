import axios from "axios";

const URL = "http://localhost:7000";
export const requestOtp = async (email) => {
  try {
    const res = await axios.post(`${URL}/user/sendOtp`, { email });
    return res?.data;
  } catch (error) {
    console.log(error);
  }
};

export const verifyOtp = async (data) => {
  try {
    const res = await axios.post(`${URL}/user/verifyOtp`, data);
    return res?.data;
  } catch (error) {
    console.log(error);
  }
};

export const uploadFile = async (data, token) => {
  try {
    const response = await axios.post(`${URL}/upload`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.fileUrl;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getAllLiveUser = async (token) => {
  try {
    const response = await axios.get(`${URL}/user/liveUser`,{
        headers: {
            Authorization: `Bearer ${token}`,
          },
    });

    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

