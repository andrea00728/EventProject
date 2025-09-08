export const getConditionalSubMenus = (forfait) => {
  const baseSubMenus = [
    {
      path: "/evenement",
      name: "Organisations",
      icon: "/red-carpet.png",
      description: "Gérez et organisez tous vos événements avec efficacité",
    },
    {
      path: "/evenement/evenement",
      name: "Événements",
      icon: "/file.png",
      description: "Créez et planifiez vos événements en quelques clics",
    },
    {
      path: "/evenement/tables",
      name: "Tables",
      icon: "/chair.png",
      description: "Configurez la disposition et l'agencement des tables",
    },
    {
      path: "/evenement/invites",
      name: "Invités",
      icon: "/guest.png",
      description: "Gérez votre liste d'invités et leurs informations",
    },
    {
      path: "/evenement/invitation",
      name: "Invitations",
      icon: "/invitation.png",
      description: "Envoyez des invitations personnalisées et suivez les réponses",
    },
    {
      path: "/evenement/personnel",
      name: "Personnel",
      icon: "/invitation.png",
      description: "Coordonnez votre équipe et assignez les rôles et tâches",
    },
    {
      path: "/evenement/restauration",
      name: "Restauration",
      icon: "/invitation.png",
      description: "Gérez les services de restauration pour vos événements",
    },
    {
      path: "/evenement/dashboard",
      name: "dashboard",
      icon: "/iconDash.png",
      description: "Vus d'ensemble de votre organisation",
    },
  ];

  const forfaitName = forfait ? forfait.toLowerCase() : "default";
  console.log("Forfait utilisé pour sous-menus :", forfaitName); 
  if (forfaitName === "freemium") {
    return baseSubMenus.filter(
      (item) => item.name !== "Personnel" && item.name !== "Restauration"
    );
  } else if (forfaitName === "starter") {
    return baseSubMenus.filter((item) => item.name !== "Restauration");
  } else {
    return baseSubMenus;
  }
};