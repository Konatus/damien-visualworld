import requests
import json

# Configuration
WORLD_ID = "68932ca97baa671b9427c55f"
BOARD_CONTEXT_ID = "68a5ad99a7a68e06dca31859"
API_BASE_URL = "http://localhost:8080"

# Faire un appel GET pour voir la structure exacte
url = f"{API_BASE_URL}/api/board-io"
params = {
    "worldId": WORLD_ID,
    "boardId": BOARD_CONTEXT_ID
}

print("Appel GET pour voir la structure...")
response = requests.get(url, params=params)
data = response.json()

# Sauvegarder la réponse dans un fichier pour l'examiner
with open('api_response.json', 'w') as f:
    json.dump(data, f, indent=2)

print("\nStructure de la réponse:")
print(json.dumps(data, indent=2))