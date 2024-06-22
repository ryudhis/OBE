// utils/api.js
import axiosConfig from "./axios";

export const getAccountData = async () => {
  try {
    const response = await axiosConfig.get("/api/account");
    if (response.data.status !== 400) {
      const data = response.data.data.shift();
      return data;
    } else {
      alert(response.data.message);
      return null;
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
};
