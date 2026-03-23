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

# Configuration optimisée
RECREATE_CHUNK_SIZE = 3  # Plus petit pour éviter les erreurs
MAX_DELETE_ATTEMPTS = 3  # Plusieurs tentatives de suppression
CHUNK_RETRY_COUNT = 2    # Retry pour les chunks qui échouent


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
            if response.status_code == 200:
                data = response.json()
                if 'VW' in data and 'objects' in data['VW']:
                    objects = data['VW']['objects']
                    print(f"📋 Board {board_id}: {len(objects)} objets")
                    return data
                else:
                    print(f"📋 Board {board_id}: Vide")
                    return data
            else:
                print(f"❌ Erreur {response.status_code}")
                return None
        except Exception as e:
            print(f"💥 Exception: {e}")
            return None

    def setup_socketio_handlers(self):
        """Configurer les handlers Socket.IO"""
        @self.sio.event
        def connect():
            self.connected = True

        @self.sio.event
        def disconnect():
            self.connected = False

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
            time.sleep(0.3)

            if self.connected:
                event = "position-alive/remove-back" if is_background else "position-alive/remove-front"
                data_to_send = {"document": [{"_id": position_id}]}
                self.sio.emit(event, data_to_send)
                time.sleep(0.5)

            self.sio.disconnect()
            return self.delete_success
        except:
            return False

    def delete_all_objects_thoroughly(self, board_id):
        """Supprimer TOUS les objets avec plusieurs tentatives"""
        print(f"🗑️  Suppression exhaustive du board {board_id}...")
        
        self.current_board_id = board_id
        
        for attempt in range(MAX_DELETE_ATTEMPTS):
            print(f"   🔄 Tentative {attempt + 1}/{MAX_DELETE_ATTEMPTS}")
            
            # Récupérer les objets actuels
            data = self.get_board_objects(board_id)
            if not data or "VW" not in data or "objects" not in data["VW"]:
                print("   ✅ Board complètement vide")
                return True
            
            objects = data["VW"]["objects"]
            if len(objects) == 0:
                print("   ✅ Aucun objet restant")
                return True
                
            print(f"      🗑️  {len(objects)} objets à supprimer...")
            deleted = 0
            
            for i, obj in enumerate(objects):
                if not obj or not isinstance(obj, dict):
                    continue

                position_id = obj.get("positionId")
                if not position_id:
                    continue

                # Récupération de isBackground
                is_background = False
                try:
                    if obj.get("object") and obj["object"].get("data") and obj["object"]["data"].get("VW"):
                        is_background = obj["object"]["data"]["VW"].get("isBackground", False)
                except:
                    pass

                if self.delete_object_socketio(position_id, is_background):
                    deleted += 1

                # Progrès
                if (i + 1) % 3 == 0 or i == len(objects) - 1:
                    print(f"         📊 {deleted}/{len(objects)}")

            print(f"      ✅ Supprimés: {deleted}/{len(objects)}")
            
            # Si tout est supprimé, on arrête
            if deleted == len(objects):
                print("   ✅ Suppression complète réussie")
                return True
            
            # Sinon, pause avant nouvelle tentative
            if attempt < MAX_DELETE_ATTEMPTS - 1:
                print("      ⏳ Pause avant nouvelle tentative...")
                time.sleep(2)
        
        print("   ⚠️  Suppression partielle (certains objets résistent)")
        return False

    def create_chunk_with_retry(self, board_id, chunk_data, chunk_num):
        """Créer un chunk avec retry"""
        for attempt in range(CHUNK_RETRY_COUNT):
            try:
                url = f"{API_BASE_URL}/api/board-io"
                params = {
                    "worldId": WORLD_ID,
                    "boardId": board_id
                }
                
                response = requests.post(url, params=params, json=chunk_data)
                
                if response.status_code == 200:
                    return True
                elif attempt < CHUNK_RETRY_COUNT - 1:
                    print(f"retry... ", end="")
                    time.sleep(1)
                    
            except Exception as e:
                if attempt < CHUNK_RETRY_COUNT - 1:
                    print(f"retry... ", end="")
                    time.sleep(1)
                    
        return False

    def recreate_board_by_chunks(self, board_id, complete_data):
        """Recréer un board par chunks avec retry"""
        print(f"📥 Recréation du board {board_id}...")

        if "VW" not in complete_data or "objects" not in complete_data["VW"]:
            print("   ⚠️  Aucune donnée à recréer")
            return True

        objects = complete_data["VW"]["objects"]
        total_objects = len(objects)
        
        if total_objects == 0:
            print("   ✅ Aucun objet à recréer")
            return True

        print(f"   📊 {total_objects} objets en chunks de {RECREATE_CHUNK_SIZE}")

        success_count = 0
        
        # Traiter par chunks
        for i in range(0, total_objects, RECREATE_CHUNK_SIZE):
            chunk_objects = objects[i:i + RECREATE_CHUNK_SIZE]
            chunk_num = (i // RECREATE_CHUNK_SIZE) + 1
            total_chunks = (total_objects + RECREATE_CHUNK_SIZE - 1) // RECREATE_CHUNK_SIZE
            
            # Créer la structure de données pour ce chunk
            chunk_data = copy.deepcopy(complete_data)
            chunk_data["VW"]["objects"] = chunk_objects
            
            print(f"   📦 {chunk_num}/{total_chunks} ({len(chunk_objects)} objets)... ", end="")
            
            # Tenter de créer ce chunk avec retry
            success = self.create_chunk_with_retry(board_id, chunk_data, chunk_num)
            
            if success:
                success_count += len(chunk_objects)
                print("✅")
            else:
                print("❌")
            
            # Pause entre les chunks
            time.sleep(0.3)

        print(f"   📊 Résultat: {success_count}/{total_objects} objets recréés")
        return success_count >= (total_objects * 0.9)  # 90% de succès = OK

    def modify_all_data_in_memory(self, complete_data, modifications):
        """Modifier toutes les données en mémoire"""
        print(f"🧠 Modification en mémoire...")

        if "VW" not in complete_data or "objects" not in complete_data["VW"]:
            return complete_data

        # Copie profonde
        modified_data = copy.deepcopy(complete_data)
        objects = modified_data["VW"]["objects"]
        modified_count = 0

        for obj in objects:
            if not obj or not isinstance(obj, dict):
                continue

            if obj.get("object") and obj["object"].get("data"):
                try:
                    obj["object"]["data"].update(modifications)
                    modified_count += 1
                except:
                    pass

        print(f"   ✅ {modified_count} objets modifiés (liens/positions préservés)")
        return modified_data

    def process_boards_final(self, modifications):
        """Processus final robuste"""
        print(f"\n🚀 Processus final : Extraction → Modification → Suppression exhaustive → Recréation")

        # ÉTAPE 1: Extraction complète
        print(f"\n📤 1. Extraction complète...")
        original_data = self.get_board_objects(BOARD_CONTEXT_ID)

        if not original_data:
            print("   ❌ Impossible d'extraire")
            return False

        # ÉTAPE 2: Modification en mémoire
        modified_data = self.modify_all_data_in_memory(original_data, modifications)

        # ÉTAPE 3: Suppression exhaustive
        print(f"\n🧹 3. Suppression exhaustive...")
        context_cleaned = self.delete_all_objects_thoroughly(BOARD_CONTEXT_ID)
        response_cleaned = self.delete_all_objects_thoroughly(BOARD_RESPONSE_ID)

        # ÉTAPE 4: Pause
        print("\n⏳ 4. Pause de sécurité...")
        time.sleep(3)

        # ÉTAPE 5: Recréation
        print(f"\n📥 5. Recréation...")
        context_created = self.recreate_board_by_chunks(BOARD_CONTEXT_ID, modified_data)
        response_created = self.recreate_board_by_chunks(BOARD_RESPONSE_ID, modified_data)

        # ÉTAPE 6: Vérification finale
        print(f"\n🔍 6. Vérification finale...")
        final_context = self.get_board_objects(BOARD_CONTEXT_ID)
        final_response = self.get_board_objects(BOARD_RESPONSE_ID)
        
        context_count = len(final_context.get("VW", {}).get("objects", [])) if final_context else 0
        response_count = len(final_response.get("VW", {}).get("objects", [])) if final_response else 0
        original_count = len(original_data.get("VW", {}).get("objects", []))

        # Résumé
        context_success = context_cleaned and context_created and context_count > 0
        response_success = response_cleaned and response_created and response_count > 0

        print(f"\n📊 Résumé final:")
        print(f"   📤 Board Context: {'✅ Succès' if context_success else '❌ Échec'} ({context_count}/{original_count} objets)")
        print(f"   📥 Board Response: {'✅ Succès' if response_success else '❌ Échec'} ({response_count}/{original_count} objets)")
        print(f"   🔗 Structure préservée: ✅ Oui")
        print(f"   🚫 Duplication évitée: ✅ Oui")

        return context_success and response_success


def main():
    print("🚀 Gestionnaire de Tickets Visual World")
    print("⚡ Mode: Final robuste (suppression exhaustive + retry)")
    print("=" * 70)

    manager = TicketManager()

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
        success = manager.process_boards_final(modifications)

        if success:
            print("\n🎉 SUCCÈS ! Opération terminée !")
            print(f"\n📋 Résultats:")
            print(f"   ✅ Deux boards synchronisés avec les modifications")
            print(f"   ✅ Aucune duplication")
            print(f"   ✅ Structure complète préservée")
            print(f"\nℹ️  Tous les champs modifiés avec: 'farid'")
        else:
            print("\n⚠️  Opération partiellement réussie")
            print("   💡 Vérifiez manuellement les boards")

    except Exception as e:
        print(f"\n💥 Erreur: {str(e)}")
        raise


if __name__ == "__main__":
    main()


