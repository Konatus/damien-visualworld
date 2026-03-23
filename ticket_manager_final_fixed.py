import requests
import json
import time
import copy
import socketio
from urllib.parse import urlencode

# Configuration
API_BASE_URL = "http://localhost:8080"
WORLD_ID = "68932ca97baa671b9427c55f"
BOARD_CONTEXT_ID = "68a5ad99a7a68e06dca31859"
BOARD_RESPONSE_ID = "689dc95a6507003d8407c7fc"

# Configuration optimisée
CHUNK_SIZE = 3
MAX_RETRIES = 3


class TicketManager:
    def __init__(self):
        self.sio = None
        self.connected = False
        self.delete_success = False
        self.current_board_id = None

    def setup_socketio(self):
        """Configurer Socket.IO pour la suppression"""
        self.sio = socketio.Client()
        
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
        self.delete_success = False

        try:
            query_params = urlencode({
                "worldId": WORLD_ID,
                "boardId": self.current_board_id
            })
            connection_url = f"{API_BASE_URL}?{query_params}"
            
            if not self.connected:
                self.sio.connect(connection_url, socketio_path='socket.io')
                time.sleep(0.3)

            if self.connected:
                event = "position-alive/remove-back" if is_background else "position-alive/remove-front"
                data_to_send = {"document": [{"_id": position_id}]}
                self.sio.emit(event, data_to_send)
                time.sleep(0.5)

            return self.delete_success
        except:
            return False

    def get_board_data(self, board_id):
        """Récupérer les données d'un board"""
        url = f"{API_BASE_URL}/api/board-io"
        params = {
            "worldId": WORLD_ID,
            "boardId": board_id
        }

        try:
            response = requests.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                objects_count = len(data.get("VW", {}).get("objects", []))
                print(f"📋 Board {board_id}: {objects_count} objets")
                return data
            else:
                print(f"❌ Erreur {response.status_code}")
                return None
        except Exception as e:
            print(f"💥 Exception: {e}")
            return None

    def delete_all_objects_socketio(self, board_id):
        """Supprimer TOUS les objets avec Socket.IO"""
        print(f"🗑️  Nettoyage du board {board_id}...")
        
        self.current_board_id = board_id
        data = self.get_board_data(board_id)
        
        if not data or "VW" not in data or "objects" not in data["VW"]:
            print("   ✅ Déjà vide")
            return True
            
        objects = data["VW"]["objects"]
        if not objects:
            print("   ✅ Déjà vide")
            return True
            
        total = len(objects)
        deleted = 0
        
        # Setup Socket.IO une seule fois pour tous les objets
        self.setup_socketio()
        
        print(f"   🗑️  Suppression de {total} objets...")
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

            # Tentatives multiples pour chaque objet
            for attempt in range(MAX_RETRIES):
                if self.delete_object_socketio(position_id, is_background):
                    deleted += 1
                    break
                elif attempt < MAX_RETRIES - 1:
                    time.sleep(0.5)

            # Afficher le progrès
            if (i + 1) % 3 == 0 or i == total - 1:
                print(f"      📊 {deleted}/{total}")

        # Déconnexion Socket.IO
        if self.connected:
            self.sio.disconnect()

        print(f"   ✅ {deleted}/{total} objets supprimés")
        
        # Vérification finale
        check_data = self.get_board_data(board_id)
        remaining = len(check_data.get("VW", {}).get("objects", [])) if check_data else 0
        
        if remaining > 0:
            print(f"   ⚠️  {remaining} objets restants")
            return False
            
        return True

    def add_objects_in_chunks(self, board_id, complete_data):
        """Ajouter les objets par chunks"""
        print(f"📥 Ajout des objets au board {board_id}...")

        if "VW" not in complete_data or "objects" not in complete_data["VW"]:
            return False

        objects = complete_data["VW"]["objects"]
        total = len(objects)
        
        if total == 0:
            print("   ✅ Aucun objet à ajouter")
            return True

        print(f"   📦 {total} objets à ajouter en chunks de {CHUNK_SIZE}")
        success_count = 0

        # Traiter par chunks
        for i in range(0, total, CHUNK_SIZE):
            chunk = objects[i:i + CHUNK_SIZE]
            chunk_num = (i // CHUNK_SIZE) + 1
            total_chunks = (total + CHUNK_SIZE - 1) // CHUNK_SIZE
            
            # Créer la structure pour ce chunk
            chunk_data = copy.deepcopy(complete_data)
            chunk_data["VW"]["objects"] = chunk
            
            print(f"      Chunk {chunk_num}/{total_chunks} ({len(chunk)} objets)... ", end="")
            
            # Tentatives multiples pour chaque chunk
            success = False
            for attempt in range(MAX_RETRIES):
                if self.add_chunk(board_id, chunk_data):
                    success = True
                    success_count += len(chunk)
                    print("✅")
                    break
                elif attempt < MAX_RETRIES - 1:
                    print("retry... ", end="")
                    time.sleep(1)
            
            if not success:
                print("❌")

            time.sleep(0.5)

        print(f"   📊 {success_count}/{total} objets ajoutés")
        return success_count == total

    def add_chunk(self, board_id, chunk_data):
        """Ajouter un chunk d'objets"""
        url = f"{API_BASE_URL}/api/board-io"
        params = {
            "worldId": WORLD_ID,
            "boardId": board_id
        }

        try:
            response = requests.post(url, params=params, json=chunk_data)
            return response.status_code == 200
        except:
            return False

    def modify_data(self, data, modifications):
        """Modifier les données en mémoire"""
        print("✏️  Modification des données...")
        
        if "VW" not in data or "objects" not in data["VW"]:
            return data

        modified = copy.deepcopy(data)
        objects = modified["VW"]["objects"]
        modified_count = 0

        for obj in objects:
            if obj.get("object") and obj["object"].get("data"):
                try:
                    obj["object"]["data"].update(modifications)
                    modified_count += 1
                except:
                    pass

        print(f"   ✅ {modified_count} objets modifiés")
        return modified

    def process_boards(self, modifications):
        """Processus complet optimisé"""
        print("\n🚀 DÉBUT DU PROCESSUS\n")

        # 1. Extraction des données source
        print("1️⃣  Extraction des données source...")
        source_data = self.get_board_data(BOARD_CONTEXT_ID)
        if not source_data:
            return False
        
        original_count = len(source_data.get("VW", {}).get("objects", []))

        # 2. Modification des données
        print("\n2️⃣  Modification des données...")
        modified_data = self.modify_data(source_data, modifications)

        # 3. Nettoyage complet des boards avec Socket.IO
        print("\n3️⃣  Nettoyage des boards...")
        context_cleaned = self.delete_all_objects_socketio(BOARD_CONTEXT_ID)
        response_cleaned = self.delete_all_objects_socketio(BOARD_RESPONSE_ID)

        if not (context_cleaned and response_cleaned):
            print("❌ Échec du nettoyage")
            return False

        # 4. Pause de sécurité
        print("\n⏳ Pause de sécurité...")
        time.sleep(2)

        # 5. Ajout des objets modifiés par chunks
        print("\n4️⃣  Ajout des objets modifiés...")
        context_success = self.add_objects_in_chunks(BOARD_CONTEXT_ID, modified_data)
        response_success = self.add_objects_in_chunks(BOARD_RESPONSE_ID, modified_data)

        # 6. Vérification finale
        print("\n5️⃣  Vérification finale...")
        final_context = self.get_board_data(BOARD_CONTEXT_ID)
        final_response = self.get_board_data(BOARD_RESPONSE_ID)
        
        context_count = len(final_context.get("VW", {}).get("objects", [])) if final_context else 0
        response_count = len(final_response.get("VW", {}).get("objects", [])) if final_response else 0

        # Résumé
        print("\n📊 RÉSUMÉ FINAL:")
        print(f"   📤 Board Context: {'✅' if context_count == original_count else '❌'}")
        print(f"      • Attendu: {original_count}")
        print(f"      • Obtenu: {context_count}")
        
        print(f"   📥 Board Response: {'✅' if response_count == original_count else '❌'}")
        print(f"      • Attendu: {original_count}")
        print(f"      • Obtenu: {response_count}")

        success = (context_count == original_count and 
                  response_count == original_count and
                  context_count > 0)

        print(f"\n🎯 RÉSULTAT FINAL: {'✅ SUCCÈS' if success else '❌ ÉCHEC'}")
        return success


def main():
    print("🎯 GESTIONNAIRE DE TICKETS VISUAL WORLD")
    print("=" * 50)

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
        success = manager.process_boards(modifications)
        
        if success:
            print("\n✨ OPÉRATION RÉUSSIE !")
            print("   • Tous les objets modifiés")
            print("   • Boards parfaitement synchronisés")
            print("   • Aucune duplication")
        else:
            print("\n⚠️  OPÉRATION ÉCHOUÉE")
            print("   • Voir les détails ci-dessus")

    except Exception as e:
        print(f"\n💥 Erreur: {str(e)}")
        raise


if __name__ == "__main__":
    main()


