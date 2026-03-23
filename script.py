import requests
import json
import time

# Configuration
WORLD_ID = "68932ca97baa671b9427c55f"
BOARD_CONTEXT_ID = "68a5ad99a7a68e06dca31859"
BOARD_RESPONSE_ID = "689dc95a6507003d8407c7fc"
API_BASE_URL = "http://localhost:8080"


def get_board_objects(board_id):
    """Extraire les objets d'un board"""
    url = f"{API_BASE_URL}/api/board-io"
    params = {
        "worldId": WORLD_ID,
        "boardId": board_id
    }
    response = requests.get(url, params=params)
    return response.json()


def delete_object(board_id, object_id):
    """Supprimer un objet spécifique du board"""
    url = f"{API_BASE_URL}/api/object"
    params = {
        "worldId": WORLD_ID,
        "boardId": board_id,
        "objectId": object_id
    }
    response = requests.delete(url, params=params)
    print(f"Suppression de l'objet {object_id}")
    return response.status_code == 200


def delete_all_objects_in_board(board_id):
    """Supprimer tous les objets d'un board"""
    data = get_board_objects(board_id)
    if "VW" in data and "objects" in data["VW"]:
        for obj in data["VW"]["objects"]:
            if "objectId" in obj:
                delete_object(board_id, obj["objectId"])
                # Petite pause pour éviter de surcharger l'API
                time.sleep(0.1)
    print(f"Tous les objets du board {board_id} ont été supprimés")


def update_board_objects(board_id, data):
    """Mettre à jour les objets dans un board"""
    url = f"{API_BASE_URL}/api/board-io"
    params = {
        "worldId": WORLD_ID,
        "boardId": board_id
    }
    response = requests.post(url, params=params, json=data)
    return response.json()


def modify_tickets(data):
    """Mettre FARID TEST dans les champs spécifiés"""
    if "objects" in data["VW"]:
        for obj in data["VW"]["objects"]:
            if "object" in obj and "data" in obj["object"]:
                # Modifier uniquement les champs spécifiés
                obj["object"]["data"].update({
                    "name": "FARID TEST",
                    "description": "FARID TEST",
                    "due_iteration": "FARID TEST",
                    "duration": "FARID TEST",
                    "fte": "FARID TEST",
                    "iteration": "FARID TEST",
                    "job": "FARID TEST",
                    "load": "FARID TEST",
                    "phase": "FARID TEST",
                    "team": "FARID TEST",
                    "bvalue": "FARID TEST"
                })
    return data


def main():
    try:
        # 1. Extraire les tickets du board context
        print("Extraction des tickets...")
        context_data = get_board_objects(BOARD_CONTEXT_ID)

        # 2. Modifier les tickets
        modified_data = modify_tickets(context_data)

        # 3. Supprimer tous les objets des deux boards
        print("\nNettoyage du board context...")
        delete_all_objects_in_board(BOARD_CONTEXT_ID)
        print("\nNettoyage du board response...")
        delete_all_objects_in_board(BOARD_RESPONSE_ID)

        # 4. Petite pause pour s'assurer que les suppressions sont terminées
        time.sleep(1)

        # 5. Mettre à jour avec les tickets modifiés
        print("\nMise à jour du board context...")
        update_board_objects(BOARD_CONTEXT_ID, modified_data)
        print("\nMise à jour du board response...")
        update_board_objects(BOARD_RESPONSE_ID, modified_data)

        print("\nOpération terminée avec succès!")

    except Exception as e:
        print(f"\nErreur: {str(e)}")
        raise


if __name__ == "__main__":
    main()