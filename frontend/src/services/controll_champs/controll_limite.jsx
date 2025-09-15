/**
 * 
 * @param {*} number 
 * @returns 
 * 
 *Lorsque le nombre est >=1000 a l'interface il affiche 1k par exemple et si >=1000000 il affiche 1M par exemple
 *
 */
export const FormaNumber=(number)=>{
  if(number>=1_000_000){
    return (number/1_000_000).toFixed(1).replace(/\.0$/,  '') + 'M';
  }
  if(number>=1_000){
    return (number/1_000).toFixed(1).replace(/\.0$/,  '') + 'K';
  }
  return number;
};