import { url } from "../api/url";

export const registerUser = async (userData, file) => {
    const formData = new FormData();
    for (const key in userData) {
        formData.append(key, userData[key]);
    }
    if (file) {
        formData.append('photo', file);
    }

    const response = await fetch(`${url}/auth/register`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur d\'inscription');
    }

    return await response.json();
};



// Connexion de l'utilisateur
export const loginUser = async (userData) => {
    const response = await fetch(`${url}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur de connexion');
    }
    console.log("voici l'info du token", response)

    return await response.json(); // Assurez-vous que cela renvoie { access_token: "votre_token" }
};
