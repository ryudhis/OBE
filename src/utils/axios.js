import axios from "axios";
import Cookies from "js-cookie";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

// Where you would set stuff like your 'Authorization' header, etc ...

instance.defaults.headers.common["Content-Type"] = "application/json";

// Also add/ configure interceptors && all the other cool stuff
instance.interceptors.request.use(function (config) {
  const token = Cookies.get("token");
  config.headers.Authorization = token ? `Bearer ${token}` : "";
  return config;
});

export default instance;
