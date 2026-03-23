import requests
import json
import time
import socketio
from urllib.parse import urlencode
import copy

# Configuration
API_BASE_URL = "http://localhost:8080"
FRONTEND_URL = "http://localhost"
WORLD_ID = "68932ca97baa671b9427c55f"
BOARD_CONTEXT_ID = "68a5ad99a7a68e06dca31859"
BOARD_RESPONSE_ID = "689dc95a6507003d8407c7fc"

# Configuration des lots - réduisons drastiquement
BATCH_SIZE = 3  # Traiter seulement 3 objets à la fois
MAX_RETRIES = 3  # Nombre de tentatives


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
            self.connected = True

        @self.sio.event
        def disconnect():
            self.connected = False

        @self.sio.event
        def connect_error(data):
            pass

        @self.sio.on('connection-me')
        def on_connection_me(data):
            pass

        @self.sio.on('$connect')
        def on_connect_ready(data):
            pass

        @self.sio.on('position-alive')
        def on_position_alive(data):
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
            time.sleep(0.5)

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
                time.sleep(1)

            self.sio.disconnect()
            return self.delete_success

        except Exception as e:
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
                print(f"   🗑️  [{i + 1}/{total_objects}] '{object_name}'... ", end="")

                success = self.delete_object_socketio(position_id, is_background)

                if success:
                    deleted_count += 1
                    print("✅")
                else:
                    print("❌")

                # Pause entre les suppressions
                time.sleep(0.2)

        print(f"   📊 Résultat: {deleted_count}/{total_objects} objets supprimés")
        return deleted_count == total_objects

    def update_board_objects_batch_with_retry(self, board_id, data, batch_size=BATCH_SIZE):
        """Mettre à jour les objets dans un board par lots avec retry et taille adaptative"""
        print(f"\n📝 Mise à jour du board {board_id} par lots adaptatifs...")

        if "VW" not in data or "objects" not in data["VW"]:
            print("   ⚠️  Aucun objet à mettre à jour")
            return True

        objects = data["VW"]["objects"]
        total_objects = len(objects)
        
        if total_objects == 0:
            print("   ⚠️  Aucun objet à traiter")
            return True

        print(f"   📊 {total_objects} objets à traiter")

        success_count = 0
        current_batch_size = batch_size
        
        # Traiter par lots avec taille adaptative
        i = 0
        while i < total_objects:
            batch_objects = objects[i:i + current_batch_size]
            batch_number = (i // current_batch_size) + 1
            
            print(f"\n   📦 Lot {batch_number} - {len(batch_objects)} objets... ", end="")
            
            # Créer une structure de données pour ce lot
            batch_data = copy.deepcopy(data)
            batch_data["VW"]["objects"] = batch_objects
            
            # Tenter d'envoyer ce lot avec retry
            success = False
            attempts = 0
            
            while attempts < MAX_RETRIES and not success:
                attempts += 1
                
                if attempts > 1:
                    print(f"\n      🔄 Tentative {attempts}/{MAX_RETRIES}... ", end="")
                
                success = self.update_board_objects_single(board_id, batch_data)
                
                if success:
                    success_count += len(batch_objects)
                    print("✅")
                    i += current_batch_size
                    # Rétablir la taille de lot normale en cas de succès
                    current_batch_size = batch_size
                else:
                    if attempts == MAX_RETRIES:
                        # Si tous les retry échouent, essayons avec une taille plus petite
                        if current_batch_size > 1:
                            current_batch_size = max(1, current_batch_size // 2)
                            print(f"❌ Réduction taille lot à {current_batch_size}")
                            attempts = 0  # Reset attempts avec nouvelle taille
                        else:
                            print("❌ Échec définitif")
                            i += current_batch_size  # Passer au lot suivant
                    else:
                        print("❌ Retry... ", end="")
                        time.sleep(1)  # Pause avant retry

        print(f"\n   📊 Résultat final: {success_count}/{total_objects} objets mis à jour")
        return success_count == total_objects

    def update_board_objects_single(self, board_id, data):
        """Mettre à jour les objets dans un board (requête unique)"""
        url = f"{API_BASE_URL}/api/board-io"
        params = {
            "worldId": WORLD_ID,
            "boardId": board_id
        }

        try:
            response = requests.post(url, params=params, json=data)

            if response.status_code == 200:
                return True
            else:
                return False
        except Exception as e:
            return False

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
                # Appliquer les modifications
                try:
                    obj["object"]["data"].update(modifications)
                    modified_count += 1
                except (AttributeError, TypeError) as e:
                    pass

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

        # ÉTAPE 3: Nettoyer le board context d'abord
        print(f"\n🧹 3. Nettoyage du board context...")
        context_clean_success = self.delete_all_objects_in_board(BOARD_CONTEXT_ID)

        # ÉTAPE 4: Pause de sécurité
        print("\n⏳ 4. Pause de sécurité...")
        time.sleep(2)

        # ÉTAPE 5: Remettre les données modifiées sur le board context par lots
        print(f"\n🔄 5. Mise à jour du board context...")
        context_update_success = self.update_board_objects_batch_with_retry(BOARD_CONTEXT_ID, modified_data)

        # ÉTAPE 6: Nettoyer le board response
        print(f"\n🧹 6. Nettoyage du board response...")
        response_clean_success = self.delete_all_objects_in_board(BOARD_RESPONSE_ID)

        # ÉTAPE 7: Pause de sécurité
        print("\n⏳ 7. Pause de sécurité...")
        time.sleep(2)

        # ÉTAPE 8: Copier les données modifiées vers le board response par lots
        print(f"\n📋 8. Copie vers le board response...")
        response_update_success = self.update_board_objects_batch_with_retry(BOARD_RESPONSE_ID, modified_data)

        # ÉTAPE 9: Vérification finale
        context_success = context_clean_success and context_update_success
        response_success = response_clean_success and response_update_success

        print(f"\n📊 Résumé final:")
        print(f"   📤 Board Context: {'✅ Succès' if context_success else '❌ Échec'}")
        print(f"   📥 Board Response: {'✅ Succès' if response_success else '❌ Échec'}")
        print(f"   🚫 Duplication évitée: ✅ Oui")

        return context_success and response_success


def main():
    print("🚀 Gestionnaire de Tickets Visual World")
    print("🔄 Mode: Traitement adaptatif avec retry")
    print("=" * 65)

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
            print(f"   1️⃣  Board Context nettoyé et recréé avec les nouvelles valeurs")
            print(f"   2️⃣  Board Response nettoyé et rempli avec la copie")
            print(f"   3️⃣  Traitement adaptatif avec retry automatique")
            print(f"\n📤 Board Context: {BOARD_CONTEXT_ID}")
            print(f"📥 Board Response: {BOARD_RESPONSE_ID}")
            print(f"✏️  Tous les champs modifiés avec: 'farid'")
        else:
            print("\n❌ L'opération a échoué")

    except Exception as e:
        print(f"\n💥 Erreur inattendue: {str(e)}")
        raise


if __name__ == "__main__":
    main()


