import axios from "axios";

const tboAPI = axios.create({
 baseURL: process.env.TBO_FLIGHT_API_URL,
 headers: {
  Accept: 'application/json',
  'Content-Type': 'application/json;charset=UTF-8',
 },
});

export default tboAPI;