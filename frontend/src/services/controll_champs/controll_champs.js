    import axios from "axios";
    
    const API_KEY=import.meta.env.VITE_APP_MAILBOXLAYER_KEY;
    export const checkEmail = async (email) => {
        try{
            const response=await axios.get('https://apilayer.net/api/check',{
                params:{
                    access_key:API_KEY,
                    email,
                }
            });
            return response.data.smtp_check===true;
        } catch (error) {
                console.error('Erreur vérification email:', error);
                return false; // En cas d’erreur, considérer comme invalide
            }
      };


      /**
       * 
       * 
       * controlle champs pour les text
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
       * 
       * controlle champs pour chiffre
       * 
       */

      export const chiffreControll=(chiffre)=>{
        const regexChiffre = /^[0-9]*$/;
        if(!regexChiffre.test(chiffre)){
              return chiffre.replace(/\D/g, "");
        }
        return chiffre;
      }
