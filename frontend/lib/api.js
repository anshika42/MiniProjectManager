import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function api(path, { token, method, body, headers } = {}) {
  try {
    const response = await axios.request({
      url: `${API_URL}${path}`,
      method,
      data: body,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Request failed.");
  }
}
