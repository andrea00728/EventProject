export const getSatisfactionLevel =(rating)=>{
     switch (rating) {
    case 1:
      return "decevant";
    case 2:
      return "moyen";
    case 3:
      return "bien";
    case 4:
      return "tres_bien";
    case 5:
      return "excellent";
    default:
      return "decevant";
  }
};


export const satisfactionDisplay = {
  decevant: "Décevant",
  moyen: "Moyen",
  bien: "Bien",
  tres_bien: "Très bien",
  excellent: "Excellent",
};

export const mapSatisfactionToStars = (satisfaction) => {
  switch (satisfaction) {
    case "decevant":
      return 1;
    case "moyen":
      return 2;
    case "bien":
      return 3;
    case "tres_bien":
      return 4;
    case "excellent":
      return 5;
    default:
      return 3;
  }
};
