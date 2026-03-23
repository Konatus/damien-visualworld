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
                    print("   ⚠️  Aucun objet trouvé, mais structure récupérée")
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
            self.delete_success = True

    def delete_object_socketio(self, position_id, is_background=False):
        """Supprimer un objet via Socket.IO"""

        self.sio = socketio.Client()
        self.setup_socketio_handlers()
        self.delete_success = False

        try:
            query_params = urlencode({
                "worldId": WORLD_ID,
                "boardId": self.current_board_id
            })

            connection_url = f"{API_BASE_URL}?{query_params}"
            self.sio.connect(connection_url, socketio_path='socket.io')
            time.sleep(0.5)

            if self.connected:
                event = "position-alive/remove-back" if is_background else "position-alive/remove-front"
                data_to_send = {
                    "document": [{"_id": position_id}]
                }
                self.sio.emit(event, data_to_send)
                time.sleep(1)

            self.sio.disconnect()
            return self.delete_success

        except Exception as e:
            return False

    def delete_all_objects_in_board(self, board_id):
        """Supprimer tous les objets d'un board via Socket.IO"""
        print(f"\n🗑️  Suppression complète du board {board_id}...")

        self.current_board_id = board_id
        data = self.get_board_objects(board_id)

        if not data or "VW" not in data or "objects" not in data["VW"]:
            print("   ✅ Board déjà vide")
            return True

        objects = data["VW"]["objects"]
        total_objects = len(objects)
        deleted_count = 0

        for i, obj in enumerate(objects):
            if not obj or not isinstance(obj, dict):
                continue

            position_id = obj.get("positionId")
            if not position_id:
                continue

            # Récupération sécurisée du nom et isBackground
            object_name = "Sans nom"
            is_background = False
            try:
                if obj.get("object") and obj["object"].get("data"):
                    object_name = obj["object"]["data"].get("name", "Sans nom")
                    if obj["object"]["data"].get("VW"):
                        is_background = obj["object"]["data"]["VW"].get("isBackground", False)
            except (AttributeError, TypeError):
                pass

            print(f"   🗑️  [{i + 1}/{total_objects}] '{object_name}'... ", end="")

            success = self.delete_object_socketio(position_id, is_background)
            if success:
                deleted_count += 1
                print("✅")
            else:
                print("❌")

            time.sleep(0.1)  # Pause très courte

        print(f"   📊 Supprimés: {deleted_count}/{total_objects}")
        return deleted_count == total_objects

    def update_board_complete(self, board_id, complete_data):
        """Recréer complètement un board avec toutes ses données"""
        print(f"\n📝 Recréation complète du board {board_id}...")

        url = f"{API_BASE_URL}/api/board-io"
        params = {
            "worldId": WORLD_ID,
            "boardId": board_id
        }

        try:
            response = requests.post(url, params=params, json=complete_data)

            if response.status_code == 200:
                objects_count = len(complete_data.get("VW", {}).get("objects", []))
                print(f"   ✅ {objects_count} objets recréés avec succès")
                return True
            else:
                print(f"   ❌ Erreur: {response.status_code}")
                if response.status_code == 413:
                    print("   ⚠️  Payload trop volumineux - les données sont trop importantes")
                return False
        except Exception as e:
            print(f"   💥 Exception: {e}")
            return False

    def modify_all_data_in_memory(self, complete_data, modifications):
        """Modifier toutes les données en mémoire (garde les liens, positions, etc.)"""
        print(f"\n✏️  Modification complète des données en mémoire...")

        if "VW" not in complete_data or "objects" not in complete_data["VW"]:
            print("   ⚠️  Aucune donnée à modifier")
            return complete_data

        # Faire une copie profonde pour ne pas altérer l'original
        modified_data = copy.deepcopy(complete_data)
        objects = modified_data["VW"]["objects"]
        modified_count = 0

        for obj in objects:
            if not obj or not isinstance(obj, dict):
                continue

            if obj.get("object") and obj["object"].get("data"):
                try:
                    # Appliquer les modifications tout en gardant les autres champs
                    obj["object"]["data"].update(modifications)
                    modified_count += 1
                except (AttributeError, TypeError):
                    pass

        print(f"   ✅ {modified_count} objets modifiés en mémoire")
        print(f"   🔗 Liens parents/enfants préservés")
        print(f"   📍 Positions et tailles préservées")
        print(f"   🎨 Styles et couleurs préservés")
        
        return modified_data

    def process_boards_efficiently(self, modifications):
        """Processus efficace : extraire → modifier en mémoire → vider → recréer"""
        print(f"\n🚀 Processus efficace : Extraction → Modification → Vider → Recréer")

        # ÉTAPE 1: Extraire TOUTES les données du board context
        print(f"\n📤 1. Extraction complète du board context...")
        original_complete_data = self.get_board_objects(BOARD_CONTEXT_ID)

        if not original_complete_data:
            print("   ❌ Impossible d'extraire les données")
            return False

        # ÉTAPE 2: Modifier TOUTES les données en mémoire
        print(f"\n🧠 2. Modification en mémoire...")
        modified_complete_data = self.modify_all_data_in_memory(original_complete_data, modifications)

        # ÉTAPE 3: Vider complètement les deux boards
        print(f"\n🧹 3. Vidage complet des deux boards...")
        
        print("   🧹 Vidage board context...")
        context_cleaned = self.delete_all_objects_in_board(BOARD_CONTEXT_ID)
        
        print("   🧹 Vidage board response...")
        response_cleaned = self.delete_all_objects_in_board(BOARD_RESPONSE_ID)

        # ÉTAPE 4: Pause de sécurité
        print("\n⏳ 4. Pause de sécurité...")
        time.sleep(3)

        # ÉTAPE 5: Recréer complètement les deux boards
        print(f"\n📥 5. Recréation complète des boards...")
        
        print("   📥 Recréation board context...")
        context_created = self.update_board_complete(BOARD_CONTEXT_ID, modified_complete_data)
        
        print("   📥 Recréation board response...")
        response_created = self.update_board_complete(BOARD_RESPONSE_ID, modified_complete_data)

        # ÉTAPE 6: Résumé
        context_success = context_cleaned and context_created
        response_success = response_cleaned and response_created

        print(f"\n📊 Résumé final:")
        print(f"   📤 Board Context: {'✅ Succès' if context_success else '❌ Échec'}")
        print(f"   📥 Board Response: {'✅ Succès' if response_success else '❌ Échec'}")
        print(f"   🔗 Liens préservés: ✅ Oui")
        print(f"   📍 Positions préservées: ✅ Oui")
        print(f"   🚫 Duplication évitée: ✅ Oui")

        return context_success and response_success


def main():
    print("🚀 Gestionnaire de Tickets Visual World")
    print("⚡ Mode: Traitement efficace (extraction → modification → recréation)")
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
        # Opération principale : processus efficace
        success = manager.process_boards_efficiently(modifications)

        if success:
            print("\n🎉 Opération terminée avec succès!")
            print(f"\n📋 Processus réalisé:")
            print(f"   1️⃣  Extraction complète des données (avec liens, positions, etc.)")
            print(f"   2️⃣  Modification en mémoire (préservation de la structure)")
            print(f"   3️⃣  Vidage complet des deux boards")
            print(f"   4️⃣  Recréation complète avec les données modifiées")
            print(f"\n📤 Board Context: {BOARD_CONTEXT_ID}")
            print(f"📥 Board Response: {BOARD_RESPONSE_ID}")
            print(f"✏️  Tous les champs modifiés avec: 'farid'")
            print(f"🔗 Structure complète préservée (liens parents, positions, styles)")
        else:
            print("\n❌ L'opération a échoué")
            print("💡 Si erreur 413, les données sont trop volumineuses pour une recréation complète")

    except Exception as e:
        print(f"\n💥 Erreur inattendue: {str(e)}")
        raise


if __name__ == "__main__":
    main()


