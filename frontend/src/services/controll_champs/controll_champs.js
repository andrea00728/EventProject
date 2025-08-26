    import axios from "axios";
    
    const API_KEY=import.meta.env.VITE_APP_MAILBOXLAYER_KEY;

    const emailCache = {};

    export const checkEmail = async (email) => {
        if(emailCache[email]){
            return emailCache[email];
        }
        try{
            const response=await axios.get('https://apilayer.net/api/check',{
                params:{
                    access_key:API_KEY,
                    email,
                }
            });
            const isValid = response.data.smtp_check===true;
            emailCache[email]=isValid;
            return isValid;
        } catch (error) {
                console.error('Erreur vérification email:', error);
                return false; // En cas d’erreur, considérer comme invalide
            }
      };



      /**
       * Contrôle le champ pour le texte.
       * @param {string} text - Le champ à contrôler.
       * @returns {string} - Le champ contrôlé.
       * 
       * Si le champ contient plus de 30 caractères, le tronque.
       * Si le champ contient des chiffres, les retire.
       */
      export const textControll=(text)=>{
        const regexSansChiffre = /^[^\d]*$/;
        if(text.length>30){
            return text.slice(0,30);
        }

        if(!regexSansChiffre.test(text)){
              return texte.replace(/\d+/g, "");
        }

        return text;
      };

     

      /**
       * Contrôle le champ pour les chiffres.
       * @param {string} chiffre - Le champ à contrôler.
       * @returns {string} - Le champ contrôlé.
       * 
       * Si le champ contient des lettres, les retire.
       * Si le champ ne contient que des chiffres, le laisse inchangé.
       */
      export const chiffreControll=(chiffre)=>{
        const regexChiffre = /^[0-9]*$/;
        if(!regexChiffre.test(chiffre)){
              return chiffre.replace(/\D/g, "");
        }
        return chiffre;
      }

/**
 * Returns the maximum seating capacity based on the type of table.
 *
 * @param {string} type - The type of table (e.g., "carree", "rectangle").
 * @returns {number} - The maximum number of seats the table can accommodate.
 *                     Defaults to 20 if the type is not recognized.
 */

      export const getMaxCapacity=(type)=>{
         switch (type) {
            case "carree":
            return 8;
            case "rectangle":
            return 10;
            default:
            return 20; 
        }
      }
