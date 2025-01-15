import "dotenv/config";
import axios from "axios";

const tboFlightSearchAPI = axios.create({
 baseURL: process.env.TBO_FLIGHT_SEARCH_API_URL,
 headers: {
  Accept: 'application/json',
  'Content-Type': 'application/json;charset=UTF-8',
 },
});

const tboFlightBookAPI = axios.create({
 baseURL: process.env.TBO_FLIGHT_BOOKING_API_URL,
 headers: {
  Accept: 'application/json',
  'Content-Type': 'application/json;charset=UTF-8',
 },
});

export {tboFlightSearchAPI, tboFlightBookAPI};