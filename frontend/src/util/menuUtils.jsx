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
  ];

  if (!forfait) {
    return baseSubMenus;
  }

  if (forfait.nom === "starter") {
    return [
      ...baseSubMenus,
      {
        path: "/evenement/personnel",
        name: "Personnel",
        icon: "/invitation.png",
        description: "Coordonnez votre équipe et assignez les rôles et tâches",
      },
    ];
  }

  if (["pro", "premium", "gold"].includes(forfait.nom)) {
    return [
      ...baseSubMenus,
      {
        path: "/evenement/personnel",
        name: "Personnel",
        icon: "/invitation.png",
        description: "Coordonnez votre équipe et assignez les rôles et tâches",
      },
      {
        path: "/evenement/restauration",
        name: "Restauration",
        icon: "/payment-method.png",
        description: "Gérez les menus et services de restauration premium",
      },
    ];
  }

  return baseSubMenus;
};