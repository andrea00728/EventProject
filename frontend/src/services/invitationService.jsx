
import axiosClient from "../api/axios-client";
export const QrCodeValidation = async (payload, token) => {
  try {
    const qrCodeString = JSON.stringify(payload);
    const response = await axiosClient.post(
      `/invitations/qrCodeVerification`,
      { qrCode: qrCodeString },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error; 
  }
};



/**
 * 
 * recuperation nombre des invites presents et absents
 * 
 * 
 */
export const getCheckinStats = async (token) => {
  const response = await axiosClient.get("/guests/count/checkin", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};



export const createInvitation = async (eventId, token) => {
  const response = await axiosClient.post(
    '/invitations',
    { eventId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};


