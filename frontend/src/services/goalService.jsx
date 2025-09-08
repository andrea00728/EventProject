// src/services/goalService.jsx
import axiosClient from '../api/axios-client';

export const getUserGoal = async (userId) => {
  try {
    const res = await axiosClient.get(`/goal/${userId}`);
    return res.data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const updateUserGoal = async (userId, data) => {
  try {
    const res = await axiosClient.put(`/goal/${userId}`, data);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
