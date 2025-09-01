import axiosClient from "../api/axios-client";



// export const getUserIdForToken = async () => {
//   const response = await axiosClient.get("/auth/getId");
//   return response.data;
// };

export const getUserIdForToken = async (token) => {
  const response = await axiosClient.get("/auth/getId",{
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};


/**
 * 
 * @returns 
 * service pour recupere le nombre total des organisateur enregistrer
 */
export const getUserCount = async () => {
    const response  = await axiosClient.get('/auth/count-users');
    return response.data;
}

export const getOrgStats = async () => {
  const response = await axiosClient.get("/auth/org/stats"/*,{
    
  }*/);
  return response.data;
}

export const getIfAdminHasPassword = async (id) => {
  const response = await axiosClient.get(`/admin/has-password/${id}`,)
  return response.data;
}



export const getListOfAllAdmins = async () => {
  const response = await axiosClient.get("/admin/all");
  return response.data;
}

export const deleteOneAdmin = async (id) => {
  const response = await axiosClient.delete(`/admin/${id}`);
  return response.data;
}

export const createOneAdmin = async (admin) => {
  const response = await axiosClient.post("/admin", admin);
  return response.data;
}