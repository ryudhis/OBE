import axiosConfig from "./axios";

export const getAccountData = async () => {
  try {
    const response = await axiosConfig.get("/api/account/fetchUser");
    if (response.data.status !== 400) {
      return response.data.data;
    } else {
      alert(response.data.message);
      return null;
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
};

export const getKunci = async () => {
  try {
    const response = await axiosConfig.get("/api/kunci");
    if (response.data.status !== 400) {
      return response.data.data;
    } else {
      alert(response.data.message);
      return null;
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
};

