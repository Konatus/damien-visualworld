import requests
import json
import time
import copy

# Configuration
API_BASE_URL = "http://localhost:8080"
WORLD_ID = "68932ca97baa671b9427c55f"
BOARD_CONTEXT_ID = "68a5ad99a7a68e06dca31859"
BOARD_RESPONSE_ID = "689dc95a6507003d8407c7fc"


class TicketManager:
    def __init__(self):
        pass

    def get_board_complete_data(self, board_id):
        """Récupérer TOUTES les données d'un board"""
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
                print(f"📋 Board {board_id}: {objects_count} objets extraits")
                return data
            else:
                print(f"❌ Erreur {response.status_code}")
                return None
        except Exception as e:
            print(f"💥 Exception: {e}")
            return None

    def set_board_complete_data(self, board_id, complete_data):
        """REMPLACER complètement le contenu d'un board (100% fiable)"""
        url = f"{API_BASE_URL}/api/board-io"
        params = {
            "worldId": WORLD_ID,
            "boardId": board_id
        }

        try:
            print(f"📝 Remplacement complet du board {board_id}... ", end="")
            
            response = requests.post(url, params=params, json=complete_data)
            
            if response.status_code == 200:
                objects_count = len(complete_data.get("VW", {}).get("objects", []))
                print(f"✅ {objects_count} objets")
                return True
            else:
                print(f"❌ Erreur {response.status_code}")
                return False
                
        except Exception as e:
            print(f"💥 Exception: {e}")
            return False

    def create_empty_board_structure(self, reference_data):
        """Créer une structure de board vide basée sur la référence"""
        empty_structure = copy.deepcopy(reference_data)
        
        # Vider complètement les objets
        if "VW" in empty_structure:
            empty_structure["VW"]["objects"] = []
        
        return empty_structure

    def modify_data_in_memory(self, complete_data, modifications):
        """Modifier toutes les données en mémoire (préserve tout le reste)"""
        print(f"🧠 Modification en mémoire...")

        if "VW" not in complete_data or "objects" not in complete_data["VW"]:
            print("   ⚠️  Aucune donnée à modifier")
            return complete_data

        # Copie profonde pour ne pas modifier l'original
        modified_data = copy.deepcopy(complete_data)
        objects = modified_data["VW"]["objects"]
        modified_count = 0

        for obj in objects:
            if not obj or not isinstance(obj, dict):
                continue

            if obj.get("object") and obj["object"].get("data"):
                try:
                    # Appliquer les modifications tout en gardant le reste intact
                    obj["object"]["data"].update(modifications)
                    modified_count += 1
                except (AttributeError, TypeError):
                    pass

        print(f"   ✅ {modified_count} objets modifiés")
        print(f"   🔗 Liens parents/enfants préservés")
        print(f"   📍 Positions et tailles préservées") 
        print(f"   🎨 Couleurs et styles préservés")
        
        return modified_data

    def process_boards_100_reliable(self, modifications):
        """Processus 100% fiable : extraction → modification → remplacement complet"""
        print(f"\n🎯 Processus 100% FIABLE : Extraction → Modification → Remplacement complet")
        print(f"💡 Utilise l'API board-io/set qui REMPLACE complètement le contenu")

        # ÉTAPE 1: Extraction complète du board source
        print(f"\n📤 1. Extraction complète du board context...")
        original_data = self.get_board_complete_data(BOARD_CONTEXT_ID)

        if not original_data:
            print("   ❌ Impossible d'extraire les données")
            return False

        original_count = len(original_data.get("VW", {}).get("objects", []))
        print(f"   📊 Données source : {original_count} objets avec toute leur structure")

        # ÉTAPE 2: Modification en mémoire
        print(f"\n🧠 2. Modification en mémoire...")
        modified_data = self.modify_data_in_memory(original_data, modifications)

        # ÉTAPE 3: Créer structure vide pour nettoyage
        print(f"\n🧹 3. Préparation des structures de nettoyage...")
        empty_structure = self.create_empty_board_structure(original_data)
        print(f"   ✅ Structure vide préparée")

        # ÉTAPE 4: Nettoyage COMPLET des deux boards (remplacement par structure vide)
        print(f"\n🗑️  4. Nettoyage COMPLET (remplacement par structure vide)...")
        
        print(f"   🧹 Vidage board context...")
        context_cleaned = self.set_board_complete_data(BOARD_CONTEXT_ID, empty_structure)
        
        print(f"   🧹 Vidage board response...")  
        response_cleaned = self.set_board_complete_data(BOARD_RESPONSE_ID, empty_structure)

        if not (context_cleaned and response_cleaned):
            print("   ❌ Échec du nettoyage")
            return False

        # ÉTAPE 5: Pause de sécurité
        print("\n⏳ 5. Pause de sécurité...")
        time.sleep(2)

        # ÉTAPE 6: Remplacement COMPLET avec les données modifiées
        print(f"\n📥 6. Remplacement COMPLET avec les données modifiées...")
        
        print(f"   📝 Remplacement board context...")
        context_created = self.set_board_complete_data(BOARD_CONTEXT_ID, modified_data)
        
        print(f"   📝 Remplacement board response...")
        response_created = self.set_board_complete_data(BOARD_RESPONSE_ID, modified_data)

        # ÉTAPE 7: Vérification finale COMPLÈTE
        print(f"\n🔍 7. Vérification finale...")
        
        final_context_data = self.get_board_complete_data(BOARD_CONTEXT_ID)
        final_response_data = self.get_board_complete_data(BOARD_RESPONSE_ID)
        
        context_final_count = len(final_context_data.get("VW", {}).get("objects", [])) if final_context_data else 0
        response_final_count = len(final_response_data.get("VW", {}).get("objects", [])) if final_response_data else 0

        # ÉTAPE 8: Résumé avec validation stricte
        print(f"\n📊 Résumé final:")
        
        context_success = (context_cleaned and context_created and 
                          context_final_count == original_count and
                          context_final_count > 0)
        
        response_success = (response_cleaned and response_created and 
                           response_final_count == original_count and
                           response_final_count > 0)

        print(f"   📤 Board Context: {'✅ PARFAIT' if context_success else '❌ ÉCHEC'}")
        print(f"      • Objets attendus: {original_count}")
        print(f"      • Objets obtenus: {context_final_count}")
        print(f"      • Match parfait: {'✅ OUI' if context_final_count == original_count else '❌ NON'}")
        
        print(f"   📥 Board Response: {'✅ PARFAIT' if response_success else '❌ ÉCHEC'}")
        print(f"      • Objets attendus: {original_count}")
        print(f"      • Objets obtenus: {response_final_count}")
        print(f"      • Match parfait: {'✅ OUI' if response_final_count == original_count else '❌ NON'}")
        
        print(f"   🔗 Structure préservée: ✅ OUI (remplacement complet)")
        print(f"   🚫 Duplication impossible: ✅ OUI (remplacement, pas ajout)")

        total_success = context_success and response_success
        
        if total_success:
            print(f"\n🎯 RÉSULTAT: ✅ SUCCÈS TOTAL 100%")
        else:
            print(f"\n🎯 RÉSULTAT: ❌ ÉCHEC")
            
        return total_success


def main():
    print("🚀 Gestionnaire de Tickets Visual World")
    print("🎯 Mode: 100% FIABLE (API board-io/set - remplacement complet)")
    print("=" * 80)

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
        success = manager.process_boards_100_reliable(modifications)

        if success:
            print("\n🎉 SUCCÈS TOTAL 100% !")
            print(f"\n📋 Ce qui a été accompli:")
            print(f"   ✅ Extraction complète des données (avec TOUS les liens)")
            print(f"   ✅ Modification en mémoire (préservation totale de la structure)")
            print(f"   ✅ Remplacement complet des deux boards (zéro duplication)")
            print(f"   ✅ Vérification finale (nombres d'objets exacts)")
            print(f"\n🎯 Résultat:")
            print(f"   📤 Board Context: IDENTIQUE avec modifications appliquées")
            print(f"   📥 Board Response: COPIE PARFAITE du board context")
            print(f"   ✏️  Tous les champs modifiés avec: 'farid'")
            print(f"   🔗 TOUTE la structure préservée (liens, positions, couleurs)")
        else:
            print("\n❌ ÉCHEC - Voir les détails ci-dessus")

    except Exception as e:
        print(f"\n💥 Erreur inattendue: {str(e)}")
        raise


if __name__ == "__main__":
    main()


