import axios from "axios";
import { getBackendUrl } from "../config";

const url = getBackendUrl();
const baseURL = url.endsWith("/") ? url.slice(0, -1) : url;

const api = axios.create({
	baseURL,
	withCredentials: true,
});

export default api;
