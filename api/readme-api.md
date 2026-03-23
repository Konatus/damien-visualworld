# API

## Organisation des répertoires

  visual-world/api/src
  ├─ listeners-express
  ├─ listeners-socket-io
  ├─ controllers
  ├─ rooms
  ├─ service
  └─ utils

### Listeners-express & Listeners-socket-io

Les répertoires *listeners-express et *listeners-socket-io* contiennent chacun un fichier par périmètre de droits.

Chacun de ceux-ci est responsable de :
- l'exécution des autorisations sur les requêtes,
- la transmission de chaque requête aux *controllers*.

### Rooms

Le répertoire *rooms* contient un fichier construisant toutes les rooms.

Chacune est responsable de :
- l'exécution des autorisations sur les réponses,
- la maintenance de chaque réponse aux clients.

### Controllers

Le répertoire *controllers* contient un répertoire pour chaque type d'objet utilisé par l'API.
Celui-ci contient un fichier pour chaque action en lien avec cet objet.

Chacun est responsable de :
- le nettoyage des données reçues,
- l'appel et la coordination des services nécessaires,
- la diffusion de la réponse à une ou plusieurs rooms.

### Services

Le répertoire *services* contient des fonctions bas-niveau destinés à réaliser des actions en base de données.

Pour veiller à la réutilisation de ces fonctions, maintenues en nombre restreint, les structures de données en bases doivent rester proches dans toutes les collections. (cf. <readme-database.md>)

## Interface REST

| Requête                                                  | Cas d'utilisation                                                                    |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `GET    /api/erase-cookies`                              | Effacer tous les cookies envoyés au serveur                                          |
| `POST   /api/guest`                                      | Créer des accès invités                                                              |
| `DELETE /api/guest`                                      | Supprimer les invités avec des autorisations non valide                              |
| `GET    /api/guest/:email/:token`                        | Connecter un invité grâce à son lien personnel                                       |
| `GET    /api/img/:filename?worldId=:worldId`             | Obtenir une image utilisée par un objet du monde                                     |
| `POST   /api/img/:filename?worldId=:worldId`             | Fournir une image utilisée par un objet du monde                                     |
| `GET    /api/board-io?worldId=:worldId&boardId=:boardId` | Obtenir les données nécessaires à la recréation d'un tableau et de son environnement |
| `POST   /api/board-io?worldId=:worldId&boardId=:boardId` | Fournir les données nécessaires à la recréation d'un tableau et de son environnement |
| `POST   /api/webhook`                                    | Point d'entrée module de paiement Stripe                                             |

## Interface Socket-io

### Rooms

| Demandée par le client                 | Cas d'utilisation                                               |
| -------------------------------------- | --------------------------------------------------------------- |
| `world-alive`                          | Notifier les ajouts, suppressions, modification de mondes       |
| `world-trash`                          | Notifier les ajouts, suppressions de mondes supprimés           |
| `:worldId/board-alive`                 | Notifier les ajouts, suppressions, modification de tableaux     |
| `:worldId/board-trash`                 | Notifier les ajouts, suppressions de tableaux supprimés         |
| `:worldId/component-alive`             | Notifier les ajouts, suppressions, modification de modèles      |
| `:worldId/component-trash`             | Notifier les ajouts, suppressions de modèles supprimés          |
| `:worldId/:boardId/board-component`    | Notifier les ajouts, suppressions, modification du dock         |
| `:worldId/:boardId/board-grant`        | Notifier les ajouts, suppressions, modification d'autorisations |
| `:worldId/:boardId/position-alive`     | Notifier les ajouts, suppressions, modification de positions    |
| `:worldId/:boardId/position-trash`     | Notifier les ajouts, suppressions de positions supprimées       |
| `:worldId/:boardId/object`, `:MongoId` | Notifier les modification d'objets                              |
| `:worldId/user`                        | Notifier les ajouts, suppressions, modification d'utilisateurs  |
| `:worldId/grant`                       | Notifier les ajouts, suppressions, modification d'autorisations |

### Requêtes

Les requêtes sont nommées selon la nommenclature : `nom-de-l-objet-attendu-en-reponse/nom-de-l-action`.

| Nom du message                | Description                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| `world-alive/list`            | Lister les mondes, pour lesquels l'utilisateur dispose d'autorisations                |
| `world-alive/create`          | Créer un ou plusieurs mondes                                                          |
| `world-alive/update`          | Modifier les informations d'un ou plusieurs mondes                                    |
| `world-alive/remove`          | Supprimer un ou plusieurs mondes                                                      |
| `world-trash/list`            | Lister les mondes supprimés                                                           |
| `world-trash/restore`         | Restaurer un ou plusieurs mondes supprimés                                            |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| `board-alive/list`            | Lister les tableaux d'un monde, pour lesquelles l'utilisateur dispose d'autorisations |
| `board-alive/create`          | Créer un ou plusieurs tableaux                                                        |
| `board-alive/update`          | Modifier les informations d'un ou plusieurs tableaux                                  |
| `board-alive/remove`          | Supprimer un ou plusieurs tableaux                                                    |
| `board-trash/list`            | Lister les tableaux supprimés d'un monde                                              |
| `board-trash/restore`         | Restaurer un ou plusieurs tableaux supprimés                                          |
| `board-io/set`                | Fournir les données nécessaires à la recréation d'un tableau et de son environnement  |
| `board-io/get`                | Obtenir les données nécessaires à la recréation d'un tableau et de son environnement  |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| `component-alive/list`        | Lister les modèles d'un monde                                                         |
| `component-alive/create`      | Créer un ou plusieurs modèles                                                         |
| `component-alive/update`      | Modifier les informations d'un ou plusieurs modèles                                   |
| `component-alive/remove`      | Supprimer un ou plusieurs modèles                                                     |
| `component-trash/list`        | Lister les modèles supprimés d'un tableau                                             |
| `component-trash/restore`     | Restaurer un ou plusieurs modèles supprimés                                           |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| `board-component/list`        | Lister les modèles d'un tableau                                                       |
| `board-component/set`         | Définir la liste des modèles d'un tableau                                             |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| `position-alive/list`         | Lister les positions dans un tableau                                                  |
| `position-alive/create-front` | Créer une ou plusieurs positions foreground dans un tableau                           |
| `position-alive/update-front` | Modifier les informations d'une ou plusieurs positions foreground                     |
| `position-alive/remove-front` | Supprimer une ou plusieurs positions foreground                                       |
| `position-alive/create-back`  | Créer une ou plusieurs positions background dans un tableau                           |
| `position-alive/update-back`  | Modifier les informations d'une ou plusieurs positions background                     |
| `position-alive/remove-back`  | Supprimer une ou plusieurs positions background                                       |
| `position-alive/set-back`     | Transformer une ou plusieurs positions foreground en background                       |
| `position-alive/unset-back`   | Transformer une ou plusieurs positions background en foreground                       |
| `position-trash/list`         | Lister les positions supprimées dans un tableau                                       |
| `position-trash/restore`      | Restaurer une ou plusieurs positions supprimées                                       |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| `object/list`                 | Lire les objets d'un tableau (initialisation)                                         |
| `object/read`                 | Lire un ou plusieurs objets (ajoutés après initialisation du tableau)                 |
| `object/update`               | Modifier les informations d'un ou plusieurs objets                                    |
| `object/search`               | Rechercher un ou plusieurs objets à partir d'une chaine de caractère                  |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| `connection-me/read`          | Lire les informations et autorisations de l'utilisateur courant                       |
| `connection-me/update`        | Modifier les informations et autorisations de l'utilisateur courant                   |
| `connection-all/list-board`   | Lire les informations et autorisations des connectés à un tableau                     |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| `user/list`                   | Lister les utilisateurs sur un monde                                                  |
| `user/create`                 | Créer un ou plusieurs utilisateurs                                                    |
| `user/update`                 | Modifier les utilisateurs sur un monde                                                |
| `user/remove`                 | Supprimer un ou plusieurs utilisateurs                                                |
| `grant/list`                  | Lister les utilisateurs disposant d'autorisations sur un monde                        |
| `grant/set`                   | Définir les autorisations d'un ou plusieurs utilisateurs sur un monde                 |
| `board-grant/list`            | Lister les utilisateurs disposant d'autorisations sur un tableau                      |
| `board-grant/set`             | Définir les autorisations d'un ou plusieurs utilisateurs sur un tableau               |

## Autorisations

Les autorisations sont fixées sur trois périmètres ;
- application,
- monde,
- tableau.

Chaque appel - REST ou Socket.io - obtient des autorisations sur un seul de ces périmètres.

Le périmètre est demandé grâce à la *query* envoyée par le client :
- niveau *application*, si ni `worldId` ni `boardId` n'est défini ;
- niveau *monde*, si un `worldId` est défini mais pas un `boardId` ;
- niveau *tableau*, si un `worldId` et un `boardId` sont définis.

Dès la connexion d'une socket, deux tableaux sont ajoutés à celle-ci, dans le fichier `listeners-socket-io/index.js` :
- `socket.grant` contient les actions autorisées à l'utilisateur sur le périmètre demandé (droit sur les actions/requêtes),
- `socket.scope` contient les sous-périmètres autorisées à l'utilisateur, ou `true` en l'absence de restriction (droits sur les données/réponses).

Concrètement, `scope` est un tableau de worldId sur le périmètre application, de boardId au niveau monde.