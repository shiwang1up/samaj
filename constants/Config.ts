import { Platform } from "react-native";

const HOST ="192.168.29.117";
// const HOST = Platform.OS === "android" ? "192.168.29.117" : "localhost";
const API_BASE_URL = `http://${HOST}:4000/api/auth`;
const USER_API_BASE_URL = `http://${HOST}:4000/api/user`;

export const Config = {
  API_BASE_URL,
  USER_API_BASE_URL,
  HOST
};
