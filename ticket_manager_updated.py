import requests
import json
import time
import socketio
from urllib.parse import urlencode

# Configuration
API_BASE_URL = "http://localhost:8080"
FRONTEND_URL = "http://localhost"
WORLD_ID = "68932ca97baa671b9427c55f"
BOARD_CONTEXT_ID = "68a5ad99a7a68e06dca31859"
BOARD_RESPONSE_ID = "689dc95a6507003d8407c7fc"


class TicketManager:
    def __init__(self):
        self.sio = None
        self.connected = False
        self.delete_success = False
        self.current_board_id = None

    def get_board_objects(self, board_id):
        """Extraire les objets d'un board"""
        url = f"{API_BASE_URL}/api/board-io"
        params = {
            "worldId": WORLD_ID,
            "boardId": board_id
        }

        try:
            response = requests.get(url, params=params)
            print(f"📋 Récupération board {board_id}: Status {response.status_code}")

            if response.status_code == 200:
                data = response.json()
                if 'VW' in data and 'objects' in data['VW']:
                    objects = data['VW']['objects']
                    print(f"   ✅ {len(objects)} objets trouvés")
                    return data
                else:
                    print("   ⚠️  Aucun objet trouvé")
                    return data
            else:
                print(f"   ❌ Erreur: {response.status_code}")
                return None
        except Exception as e:
            print(f"   💥 Exception: {e}")
            return None

    def setup_socketio_handlers(self):
        """Configurer les handlers Socket.IO"""

        @self.sio.event
        def connect():
            print("   ✅ Connecté au serveur Socket.IO")
            self.connected = True

        @self.sio.event
        def disconnect():
            print("   ❌ Déconnecté du serveur Socket.IO")
            self.connected = False

        @self.sio.event
        def connect_error(data):
            print(f"   💥 Erreur de connexion: {data}")

        @self.sio.on('connection-me')
        def on_connection_me(data):
            print("   ✅ Authentification réussie")

        @self.sio.on('$connect')
        def on_connect_ready(data):
            print("   ✅ Socket.IO prêt pour les opérations")

        @self.sio.on('position-alive')
        def on_position_alive(data):
            print("   📥 Événement position-alive reçu")
            # Marquer comme succès si on reçoit une réponse
            self.delete_success = True

    def delete_object_socketio(self, position_id, is_background=False):
        """Supprimer un objet via Socket.IO"""

        self.sio = socketio.Client()
        self.setup_socketio_handlers()
        self.delete_success = False

        try:
            # Construire l'URL avec les paramètres de query
            query_params = urlencode({
                "worldId": WORLD_ID,
                "boardId": self.current_board_id
            })

            connection_url = f"{API_BASE_URL}?{query_params}"

            # Connexion
            self.sio.connect(connection_url, socketio_path='socket.io')

            # Attendre la connexion
            time.sleep(1)

            if self.connected:
                # Émettre l'événement de suppression
                event = "position-alive/remove-back" if is_background else "position-alive/remove-front"
                data_to_send = {
                    "document": [
                        {
                            "_id": position_id
                        }
                    ]
                }

                self.sio.emit(event, data_to_send)

                # Attendre la réponse
                time.sleep(2)

            self.sio.disconnect()
            return self.delete_success

        except Exception as e:
            print(f"   💥 Exception lors de la suppression: {e}")
            return False

    def delete_all_objects_in_board(self, board_id):
        """Supprimer tous les objets d'un board via Socket.IO"""
        print(f"\n🗑️  Suppression de tous les objets du board {board_id}...")

        self.current_board_id = board_id
        data = self.get_board_objects(board_id)

        if not data or "VW" not in data or "objects" not in data["VW"]:
            print("   ⚠️  Aucun objet à supprimer")
            return True

        objects = data["VW"]["objects"]
        total_objects = len(objects)
        deleted_count = 0

        for i, obj in enumerate(objects):
            # Vérification de sécurité pour éviter les NoneType
            if not obj or not isinstance(obj, dict):
                print(f"   ⚠️  Objet #{i + 1} invalide, ignoré")
                continue

            position_id = obj.get("positionId")

            # Récupération sécurisée du nom
            object_name = "Sans nom"
            try:
                if obj.get("object") and obj["object"].get("data"):
                    object_name = obj["object"]["data"].get("name", "Sans nom")
            except (AttributeError, TypeError):
                pass

            # Récupération sécurisée du flag isBackground
            is_background = False
            try:
                if (obj.get("object") and
                        obj["object"].get("data") and
                        obj["object"]["data"].get("VW")):
                    is_background = obj["object"]["data"]["VW"].get("isBackground", False)
            except (AttributeError, TypeError):
                pass

            if position_id:
                print(f"   🗑️  [{i + 1}/{total_objects}] Suppression de '{object_name}'...")

                success = self.delete_object_socketio(position_id, is_background)

                if success:
                    deleted_count += 1
                    print(f"      ✅ Supprimé")
                else:
                    print(f"      ❌ Échec")

                # Pause entre les suppressions
                time.sleep(0.5)
            else:
                print(f"   ⚠️  Pas d'ID de position pour l'objet '{object_name}'")

        print(f"   📊 Résultat: {deleted_count}/{total_objects} objets supprimés")
        return deleted_count == total_objects

    def update_board_objects(self, board_id, data):
        """Mettre à jour les objets dans un board"""
        print(f"\n📝 Mise à jour du board {board_id}...")

        url = f"{API_BASE_URL}/api/board-io"
        params = {
            "worldId": WORLD_ID,
            "boardId": board_id
        }

        try:
            response = requests.post(url, params=params, json=data)

            if response.status_code == 200:
                result = response.json()
                print(f"   ✅ Mise à jour réussie")
                return result
            else:
                print(f"   ❌ Erreur: {response.status_code}")
                return None
        except Exception as e:
            print(f"   💥 Exception: {e}")
            return None

    def modify_tickets(self, data, modifications):
        """Modifier les tickets avec les valeurs spécifiées"""
        print(f"\n✏️  Modification des tickets...")

        if "VW" not in data or "objects" not in data["VW"]:
            print("   ⚠️  Aucun objet à modifier")
            return data

        objects = data["VW"]["objects"]
        modified_count = 0

        for obj in objects:
            # Vérification de sécurité
            if not obj or not isinstance(obj, dict):
                continue

            if obj.get("object") and obj["object"].get("data"):
                # Récupération sécurisée du nom
                object_name = "Sans nom"
                try:
                    object_name = obj["object"]["data"].get("name", "Sans nom")
                except (AttributeError, TypeError):
                    pass

                print(f"   ✏️  Modification de '{object_name}'...")

                # Appliquer les modifications
                try:
                    obj["object"]["data"].update(modifications)
                    modified_count += 1
                except (AttributeError, TypeError) as e:
                    print(f"      ❌ Erreur lors de la modification: {e}")

        print(f"   📊 {modified_count} objets modifiés")
        return data

    def modify_context_and_copy_to_response(self, modifications):
        """Modifier le board context puis le copier vers response (sans duplication)"""
        print(f"\n🔄 Processus: Modifier Context → Copier vers Response")

        # ÉTAPE 1: Extraire les données originales du board context
        print(f"\n📋 1. Extraction des données du board context...")
        original_data = self.get_board_objects(BOARD_CONTEXT_ID)

        if not original_data:
            print("   ❌ Impossible d'extraire les données du board context")
            return False

        # ÉTAPE 2: Modifier les données
        print(f"\n✏️  2. Application des modifications...")
        modified_data = self.modify_tickets(original_data, modifications)

        # ÉTAPE 3: Remettre les données modifiées sur le board context
        print(f"\n🔄 3. Mise à jour du board context avec les modifications...")
        context_update_success = self.update_board_objects(BOARD_CONTEXT_ID, modified_data)

        if not context_update_success:
            print("   ❌ Échec de la mise à jour du board context")
            return False

        # ÉTAPE 4: Nettoyer le board response (pour éviter les duplications)
        print(f"\n🧹 4. Nettoyage du board response (suppression des anciens éléments)...")
        response_clean_success = self.delete_all_objects_in_board(BOARD_RESPONSE_ID)

        # ÉTAPE 5: Pause de sécurité
        print("\n⏳ 5. Pause de sécurité...")
        time.sleep(3)

        # ÉTAPE 6: Copier les données modifiées vers le board response
        print(f"\n📋 6. Copie des données modifiées vers le board response...")
        response_update_success = self.update_board_objects(BOARD_RESPONSE_ID, modified_data)

        # ÉTAPE 7: Vérification finale
        context_success = context_update_success is not None
        response_success = response_clean_success and (response_update_success is not None)

        print(f"\n📊 Résumé final:")
        print(f"   📤 Board Context (modifié): {'✅ Succès' if context_success else '❌ Échec'}")
        print(f"   📥 Board Response (copie): {'✅ Succès' if response_success else '❌ Échec'}")
        print(f"   🚫 Duplication évitée: {'✅ Oui' if response_clean_success else '❌ Non'}")

        return context_success and response_success


def main():
    print("🚀 Gestionnaire de Tickets Visual World")
    print("🔄 Mode: Modifier Context → Copier vers Response (sans duplication)")
    print("=" * 80)

    # Initialiser le gestionnaire
    manager = TicketManager()

    # Configuration des modifications
    modifications = {
        "name": "farid",
        "description": "farid",
        "due_iteration": "farid",
        "duration": "farid",
        "fte": "farid",
        "iteration": "farid",
        "job": "farid",
        "load": "farid",
        "phase": "farid",
        "team": "farid",
        "bvalue": "farid"
    }

    try:
        # Opération principale : modifier context puis copier vers response
        success = manager.modify_context_and_copy_to_response(modifications)

        if success:
            print("\n🎉 Opération terminée avec succès!")
            print(f"\n📋 Processus réalisé:")
            print(f"   1️⃣  Board Context modifié avec les nouvelles valeurs")
            print(f"   2️⃣  Board Response nettoyé (suppression des anciens éléments)")
            print(f"   3️⃣  Board Response rempli avec la copie des données modifiées")
            print(f"\n📤 Board Context: {BOARD_CONTEXT_ID}")
            print(f"📥 Board Response: {BOARD_RESPONSE_ID}")
            print(f"✏️  Modifications appliquées: {list(modifications.keys())}")
            print(f"🚫 Aucune duplication : board response nettoyé avant copie")
        else:
            print("\n❌ L'opération a échoué")

    except Exception as e:
        print(f"\n💥 Erreur inattendue: {str(e)}")
        raise


if __name__ == "__main__":
    main()

