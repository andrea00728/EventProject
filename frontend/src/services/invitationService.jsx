
import axiosClient from "../api/axios-client";
export const QrCodeValidation = async (payload) => {
  try {
    const qrCodeString = JSON.stringify(payload);
    const response = await axiosClient.post(
      `/invitations/qrCodeVerification`,
      { qrCode: qrCodeString },
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
export const getCheckinStats = async () => {
  const response = await axiosClient.get("/guests/count/checkin");
  return response.data;
};

export const getEventIdByEmail = async () => {
  const response = await axiosClient.get("/guests/geteventid/2");
  return response.data;
};

export const createInvitation = async (eventId) => {
  const response = await axiosClient.post(
    '/invitations/invit',
    { eventId }
  );
  return response.data;
};




