import axios from "axios";

export const BASE_URL = process.env.BASE_URL!;
export const BASE = process.env.BASE!;

export const api = axios.create({
  baseURL: BASE_URL,
});
