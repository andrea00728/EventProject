import { url } from "../api/url";

export const registerUser = async (userData) => {
  const formData = new FormData();
  for (const key in userData) {
    formData.append(key, userData[key]);
  }

  const response = await fetch(`${url}/auth/register`, {
    method: "POST",
    body: formData,
    credentials: "include", // Inclure les cookies
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Erreur d'inscription");
  }

  return await response.json();
};

export const loginUser = async (userData) => {
  const response = await fetch(`${url}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
    credentials: "include", // Inclure les cookies
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Erreur de connexion");
  }

  return await response.json();
};