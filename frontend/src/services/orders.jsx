import axiosClient from "../api/axios-client";

export const getAllOrdersForOnEvent = async (id) => {
  const response = await axiosClient.get('/orders/event/'+id);
  return response.data;
};

export const updateOrderStatus = async (orderId, status, token) => {
  try {
    const response = await axiosClient.patch(
      `http://api.mastertable.site/orders/${orderId}/status`,
      { status } , {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
  );
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
  }
};