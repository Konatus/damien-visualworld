import requests
import json
import time
import copy

# Configuration
API_BASE_URL = "http://localhost:8080"
WORLD_ID = "68932ca97baa671b9427c55f"
BOARD_CONTEXT_ID = "68a5ad99a7a68e06dca31859"
BOARD_RESPONSE_ID = "689dc95a6507003d8407c7fc"

# Taille optimale pour éviter l'erreur 413
CHUNK_SIZE = 3
MAX_RETRIES = 3


class TicketManager:
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

    def create_empty_board_data(self, reference_data):
        """Créer une structure de board vide"""
        empty = copy.deepcopy(reference_data)
        if "VW" in empty:
            empty["VW"]["objects"] = []
        return empty

    def modify_data(self, data, modifications):
        """Modifier les données en mémoire"""
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

        print(f"✏️  {modified_count} objets modifiés")
        return modified

    def replace_board_content(self, board_id, data):
        """Remplacer le contenu d'un board"""
        url = f"{API_BASE_URL}/api/board-io"
        params = {
            "worldId": WORLD_ID,
            "boardId": board_id
        }

        try:
            response = requests.post(url, params=params, json=data)
            return response.status_code == 200
        except:
            return False

    def replace_board_in_chunks(self, board_id, complete_data, chunk_size=CHUNK_SIZE):
        """Remplacer le contenu d'un board par chunks"""
        if "VW" not in complete_data or "objects" not in complete_data["VW"]:
            return False

        # Récupérer tous les objets
        all_objects = complete_data["VW"]["objects"]
        total_objects = len(all_objects)
        
        if total_objects == 0:
            return True

        print(f"📦 Remplacement par chunks ({total_objects} objets)...")

        # D'abord, vider le board
        empty_data = self.create_empty_board_data(complete_data)
        if not self.replace_board_content(board_id, empty_data):
            print("❌ Échec du vidage initial")
            return False

        # Puis, ajouter les objets par chunks
        success_count = 0
        
        for i in range(0, total_objects, chunk_size):
            chunk = all_objects[i:i + chunk_size]
            chunk_num = (i // chunk_size) + 1
            total_chunks = (total_objects + chunk_size - 1) // chunk_size
            
            print(f"   Chunk {chunk_num}/{total_chunks} ({len(chunk)} objets)... ", end="")
            
            # Créer la structure pour ce chunk
            chunk_data = copy.deepcopy(empty_data)
            chunk_data["VW"]["objects"] = chunk
            
            # Essayer avec retry
            for attempt in range(MAX_RETRIES):
                if self.replace_board_content(board_id, chunk_data):
                    success_count += len(chunk)
                    print("✅")
                    break
                elif attempt < MAX_RETRIES - 1:
                    print("retry... ", end="")
                    time.sleep(1)
                else:
                    print("❌")

            time.sleep(0.5)  # Pause entre les chunks

        print(f"   📊 {success_count}/{total_objects} objets traités")
        return success_count == total_objects

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

        # 3. Traitement des boards
        print("\n3️⃣  Traitement du board context...")
        context_success = self.replace_board_in_chunks(BOARD_CONTEXT_ID, modified_data)
        
        print("\n4️⃣  Traitement du board response...")
        response_success = self.replace_board_in_chunks(BOARD_RESPONSE_ID, modified_data)

        # 5. Vérification finale
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


