import "dotenv/config";
import axios from "axios";
import zlib from 'zlib';
import {promisify} from 'util';

const gunzip = promisify(zlib.gunzip);

// Create response interceptor to handle gzip decompression
const handleCompressedResponse = async (response: any) => {
 if (response.headers['content-encoding'] === 'gzip') {
  const buffer = Buffer.from(response.data);
  const decompressed = await gunzip(buffer);
  response.data = JSON.parse(decompressed.toString());
 };

 return response;
};

const tboFlightSearchAPI = axios.create({
 baseURL: process.env.TBO_FLIGHT_SEARCH_API_URL,
 headers: {
  Accept: 'application/json',
  'Content-Type': 'application/json;charset=UTF-8',
  'Accept-Encoding': 'gzip, deflate'  // Add compression support
 },
  decompress: true  // Enable automatic decompression in axios
});

const tboFlightBookAPI = axios.create({
 baseURL: process.env.TBO_FLIGHT_BOOKING_API_URL,
 headers: {
  Accept: 'application/json',
  'Content-Type': 'application/json;charset=UTF-8',
  'Accept-Encoding': 'gzip, deflate'  // Add compression support
 },
 decompress: true  // Enable automatic decompression in axios
});

// Add response interceptors to both API instances
tboFlightSearchAPI.interceptors.response.use(handleCompressedResponse);
tboFlightBookAPI.interceptors.response.use(handleCompressedResponse);

export {tboFlightSearchAPI, tboFlightBookAPI};