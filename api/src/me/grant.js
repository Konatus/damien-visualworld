// Board & world leveled grants
const BOARD_OBSERVER = [
  "object/list", // Lister les objets
  "object/read", // Lire le contenu d'un ou plusieurs objets
  "connection-all/list-board", // Lister les utilisateurs connectés au tableau
  "connection-all/get-screen", // Demander la position d'écran d'autres utilisateurs connectés au tableau
  "connection-all/set-screen", // Fournir sa position d'écran à d'autres utilisateurs connectés au tableau
  "img/read", // Obtenir une image utilisée par un objet du monde (REST)
  "link-alive/list", // Lister les liens
  "link-alive/read", // Lire le contenu d'un ou plusieurs liens
  "position-alive/list", // Lister les positions (d'objets dans un tableau)
];
const BOARD_PARTICIPANT = [
  ...BOARD_OBSERVER, // Un participant dispose des mêmes droits qu'observateur, plus...
  "board-component/list",
  "object-search", // Rechercher un objet
  "object/update", // Modifier le contenu d'un objet
  "img/create", // Fournir une image utilisée par un objet du monde (REST)
  "link-alive/create", // Créer un ou plusieurs liens
  "link-alive/update", // Modifier un ou plusieurs liens
  "link-alive/remove", // Supprimer un ou plusieurs liens
  "link-trash/restore", // Restaurer un ou plusieurs liens supprimés
  "position-alive/create-front", // Créer une ou plusieurs positions de premier plan (dans un tableau)
  "position-alive/update-front", // Modifier une ou plusieurs positions de premier plan
  "position-alive/remove-front", // Supprimer une ou plusieurs positions de premier plan
  "position-trash/restore", // Restaurer une ou plusieurs positions supprimées
  "position-alive/transmute", // Changer le modèle d'objet associé à une position
  "position-alive/resize-front", // /!\ Front : redimensionner une ou plusieurs positions de premier plan
  "position-alive/resize-back", // /!\ Front : redimensionner une ou plusieurs positions d'arrière plan
  "board-shortcut/read-boards", // Lister les tableaux disponibles pour un raccourci, et les objets déjà existantes
  "board-io/get-png", // /!\ Front : exporter un png d'un tableau
  "board-io/get-pdf", // /!\ Front : exporter un pdf d'un tableau
  "object-model/update", // Modifier le modèle d'un objet
];
const BOARD_ANIMATOR = [
  ...BOARD_PARTICIPANT, // Un animateur dispose des mêmes droits qu'un participant, plus...
  "board-alive/add-state", // Charger l'état d'un tableau dans un autre (template de tableau, où le modeleur est animateur du template)
  "board-alive/load-state", // Restaurer un état précédent d'un tableau
  "board-alive/save-state", // Enregistrer l'état courant d'un tableau
  "board-component/set", // Modifier la liste des modèles d'objet favoris d'un tableau
  "board-grant/list", // Lister les autorisations accordées sur un tableau
  "board-grant/create", // Créer une autorisation sur un tableau
  "board-grant/update", // Modifier une autorisation sur un tableau
  "board-io/get", // Exporter toutes les données d'un tableau (socket ou REST)
  "board-io/set", // Importer toutes les données d'un tableau (REST Leroy-Merlin ou imports JSON/XLSX depuis le front)
  "guest/create", // Créer des accès invités (REST)
  "guest/remove", // Supprimer des accès invités (REST)
  "position-alive/create-back", // Créer une ou plusieurs positions d'arrière-plan (dans un tableau)
  "position-alive/update-back", // Modifier une ou plusieurs positions d'arrière-plan
  "position-alive/set-back", // Mettre une position de premier plan à l'arrière-plan
  "position-alive/unset-back", // Mettre une position de l'arrière-plan au premier plan
  "position-alive/remove-back", // Supprimer une ou plusieurs positions d'arrière-plan
  "position-alive/remove-completely", // Supprimer une ou plusieurs et positions définitivement
  "position-trash/list", // Lister les positions supprimées (dans un tableau)
  "user-alive/list", // Lister les utilisateurs (sur un monde)
  "user-alive/create", // Créer un utilisateur
  "user-alive/update", // Modifier un ou plusieurs utilisateurs (utile ? n'est pas appelé par le front...)
  "user-trash/list", // Lister les utilisateurs supprimés
  "user-trash/restore", // Restaurer un ou plusieurs utilisateurs supprimés
  "jira-project/get", // Projet JIRA
  "jira-issue/get", // Issue JIRA
  "jira-issue/create", // Crée un ticket JIRA
  "jira-team/get", // Équipes JIRA
];
const WORLD_OBSERVER = [
  // A participant or observer on - at least one board - receives following minimal grant on the world...
  "board-alive/list", // Lister les tableaux
  "component-alive/list", // Lister les modèles d'objet
  "link-model-alive/list", // Lister les modèles de lien
];
const WORLD_PARTICIPANT = [...WORLD_OBSERVER];
const WORLD_ANIMATOR = [
  ...BOARD_ANIMATOR,
  ...WORLD_PARTICIPANT,
  "board-alive/create", // Créer un tableau
  "board-alive/update", // Modifier les informations d'un tableau (et le configurer)
  "board-alive/list-template", // Lister les templates de tableau
];
const WORLD_MODELER = [
  ...WORLD_ANIMATOR, // Un modeleur dispose des mêmes droits sur le monde que les animateurs, plus...
  "board-alive/create", // Créer un tableau
  "board-alive/update", // Modifier les informations d'un tableau (et le configurer)
  "board-alive/remove", // Supprimer un tableau
  "board-trash/list", // Lister les tableaux supprimés
  "board-trash/restore", // Restaurer un tableau supprimé
  "board-alive/create-template", // Créer un template de tableau
  "board-alive/remove-template", // Supprimer un template de tableau
  "board-io/set-json", // /!\ Front : faire un import json
  "component-alive/create", // Créer un modèle d'objet
  "component-alive/update", // Modifier un modèle d'objet
  "component-alive/check-remove", // Vérifie qu'un modèle d'objet peut être supprimé
  "component-alive/remove", // Supprimer un modèle d'objet
  "component-trash/list", // Lister les modèles d'objet supprimés
  "component-trash/restore", // Restaurer un modèle d'objet supprimé
  "link-model-alive/create", // Créer un modèle de lien
  "link-model-alive/update", // Modifier un modèle de lien
  "link-model-alive/check-remove", // Vérifie qu'un modèle de lien peut être supprimé
  "link-model-alive/remove", // Supprimer un modèle de
  "link-model-trash/list", // Lister les modèles de lien supprimés
  "link-model-trash/restore", // Restaurer un modèle de lien supprimé
  "user-alive/remove", // Supprimer un ou plusieurs utilisateurs
];
const WORLD_ADMINISTRATOR = [
  ...WORLD_MODELER, // Un administrateur dispose des mêmes droits qu'un modeleur de niveau monde, plus...
  "grant/list", // Lister les autorisations accordées sur un monde
  "grant/create", // Créer une autorisation sur un monde
  "grant/update", // Modifier une autorisation sur un monde
  "world-alive/update", // Modifier les informations d'un monde (et le configurer)
  "world-use/get", // Récupérer l'état d'utilisation du monde
  "world-alive/demo", // Limiter les Modififications des informations du monde démo
];
const WORLD_DEMO_EXCLUSION = [
  "user-alive/list", // Lister les utilisateurs (sur un monde)
  "user-alive/create", // Créer un utilisateur
  "user-alive/update", // Modifier un ou plusieurs utilisateurs (utile ? n'est pas appelé par le front...)
  "user-alive/remove", // Supprimer un ou plusieurs utilisateurs
  "user-trash/list", // Lister les utilisateurs supprimés
  "user-trash/restore", // Restaurer un ou plusieurs utilisateurs supprimés
  "world-alive/update", // Modifier les informations d'un monde (et le configurer)
];

// App leveled grants
const APP_YES = [
  "connection-me/read", // Lire ses propres informations de profil
  "connection-me/update", // Modifer ses propres informations de profil
  "erase-cookies", // Effacer tous les cookies envoyés au serveur (REST)
  "guest/login", // Connecter un invité grâce à son lien personnel (REST)
  "world-alive/list", // Lister les mondes auxquels on peut accéder
  "img/read", // TODO: move to WORLD_MINIMAL?
  "img/create", // TODO: move to WORLD_MINIMAL?
  "profile/edit", // Modifier les infos utilisateur
];
const APP_ROOT = [
  "template-io/get", // Exporter tous les templates d'un monde
  "template-io/set", // Importer les templates d'un monde
  "world-alive/create", // Créer un monde
  "world-alive/remove", // Supprimer un monde
  "world-use/get", // Récupérer l'état d'utilisation du monde, même si le monde n'est pas rootable
  "world-use/set", // Définir les limites d'utilisation du monde
  "world-trash/list", // Lister les mondes supprimés
  "world-trash/restore", // Restaurer un monde supprimé
];

export default async ({ app, world, board }) => {
  const appGrant = [...APP_YES, ...(app.isRoot ? APP_ROOT : [])];

  const worldGrant = {};
  for (let worldId in world) {
    const grant = [
      ...new Set([
        ...(world[worldId].modeler ? WORLD_MODELER : []),
        ...(world[worldId].administrator ? WORLD_ADMINISTRATOR : []),
        ...(world[worldId].owner ? WORLD_ADMINISTRATOR : []),
        ...(world[worldId].rootable && app.isRoot ? WORLD_ADMINISTRATOR : []),
        ...(world[worldId].demoAdministrator
          ? WORLD_ADMINISTRATOR.filter(
            (item) => !WORLD_DEMO_EXCLUSION.includes(item)
          )
          : []),
      ]),
    ];
    if (grant.length) {
      worldGrant[worldId] = grant;
    }
  }

  const hasAtLeastOneAnimatorGrant = [
    ...Object.values(board).map((x) => x.animator),
  ].find((x) => !!x);
  const boardGrant = {};
  for (let boardId in board) {
    const worldId = board[boardId].worldId;

    const grant = board[boardId].template
      ? [
        ...new Set([
          // Template board
          ...(world[worldId].modeler ? BOARD_ANIMATOR : []), // A modeler has board manager grants on templates
          ...(hasAtLeastOneAnimatorGrant ? BOARD_OBSERVER : []), // An animator has observer grants on templates
        ]),
      ]
      : [
        ...new Set([
          // Usual board
          ...(board[boardId].observer ? BOARD_OBSERVER : []),
          ...(board[boardId].participant ? BOARD_PARTICIPANT : []),
          ...(board[boardId].animator ? BOARD_ANIMATOR : []),
        ]),
      ];
    if (grant.length) {
      boardGrant[boardId] = grant;

      worldGrant[worldId] = [
        ...new Set([
          ...(worldGrant[worldId] || []),
          ...(board[boardId].observer ? WORLD_OBSERVER : []),
          ...(board[boardId].participant ? WORLD_PARTICIPANT : []),
          ...(board[boardId].animator ? WORLD_ANIMATOR : []),
        ]),
      ];
    }
  }

  return {
    board: boardGrant,
    world: worldGrant,
    app: appGrant,
  };
};
