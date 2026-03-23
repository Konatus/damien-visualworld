import requests
import random
import json
import socketio
import time
from urllib.parse import urlencode

# Configuration
API_BASE_URL = "http://localhost:8080"  # API sur port 8080
FRONTEND_URL = "http://localhost"       # Frontend sur port 80
WORLD_ID = "68932ca97baa671b9427c55f"
BOARD_ID = "68a5ad99a7a68e06dca31859"

def get_board_components():
    """Récupérer tous les composants du board"""
    url = f"{API_BASE_URL}/api/board-io"
    params = {
        "worldId": WORLD_ID,
        "boardId": BOARD_ID
    }
    
    try:
        response = requests.get(url, params=params)
        print(f"Récupération des composants: Status {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'VW' in data and 'objects' in data['VW']:
                objects = data['VW']['objects']
                print(f"Nombre d'objets trouvés: {len(objects)}")
                return objects
        
        return None
    except Exception as e:
        print(f"Erreur: {e}")
        return None

def delete_component_socketio_v3(position_id, is_background=False):
    """Version corrigée de suppression via Socket.IO"""
    
    # Configuration correcte du client Socket.IO
    sio = socketio.Client()
    
    success = False
    error_msg = None
    position_alive_received = False
    
    @sio.event
    def connect():
        print("✅ Connecté au serveur Socket.IO")
    
    @sio.event
    def disconnect():
        print("❌ Déconnecté du serveur Socket.IO")
    
    @sio.event
    def connect_error(data):
        nonlocal error_msg
        error_msg = f"Erreur de connexion: {data}"
        print(error_msg)
    
    @sio.on('connection-me')
    def on_connection_me(data):
        print("✅ Authentification réussie")
        # Ne pas émettre tout de suite, attendre d'être dans la bonne room
    
    @sio.on('$connect')
    def on_connect_ready(data):
        print("✅ Socket.IO prêt")
        # Maintenant nous pouvons émettre en toute sécurité
        event = "position-alive/remove-back" if is_background else "position-alive/remove-front"
        data_to_send = {
            "document": [
                {
                    "_id": position_id
                }
            ]
        }
        
        print(f"📤 Émission de l'événement: {event}")
        print(f"📤 Données: {json.dumps(data_to_send, indent=2)}")
        
        sio.emit(event, data_to_send)
    
    @sio.on('position-alive')
    def on_position_alive(data):
        nonlocal success, position_alive_received
        position_alive_received = True
        print("✅ Événement position-alive reçu!")
        print(f"📥 Données: {json.dumps(data, indent=2)}")
        
        # Vérifier si notre position a été supprimée
        if 'document' in data:
            for doc in data['document']:
                if doc.get('_id') == position_id and doc.get('private', {}).get('deletedAt'):
                    success = True
                    print("✅ Position supprimée avec succès!")
                    break
    
    @sio.on('*')
    def catch_all(event, data):
        if event not in ['connection-me', '$connect', 'world-alive', 'world-trash']:
            print(f"📥 Événement: {event}")
            if event == 'position-alive':
                on_position_alive(data)
    
    try:
        # Construire l'URL avec les paramètres de query (syntaxe correcte)
        query_params = urlencode({
            "worldId": WORLD_ID,
            "boardId": BOARD_ID
        })
        
        connection_url = f"{API_BASE_URL}?{query_params}"
        
        print(f"🔗 Connexion à {connection_url}")
        
        # Connexion avec la syntaxe correcte
        sio.connect(
            connection_url,
            socketio_path='socket.io'
        )
        
        # Attendre plus longtemps pour la réponse
        print("⏳ Attente de la réponse (10 secondes)...")
        time.sleep(10)
        
        sio.disconnect()
        
        if success:
            print("🎉 Suppression réussie!")
            return True
        elif position_alive_received:
            print("⚠️  Position-alive reçu mais pas de confirmation de suppression")
            return False
        else:
            print("❌ Aucune réponse position-alive reçue")
            return False
        
    except Exception as e:
        print(f"💥 Exception: {e}")
        return False

def main():
    print("🚀 Script de suppression d'objet Visual World")
    print("=" * 60)
    
    print("\n📋 1. Récupération des objets du board...")
    objects = get_board_components()
    
    if not objects:
        print("❌ Aucun objet trouvé. Arrêt du script.")
        return
    
    # Sélectionner un objet au hasard
    obj = random.choice(objects)
    position_id = obj.get('positionId')
    object_id = obj.get('objectId')
    component_id = obj.get('componentId')
    
    print(f"\n🎯 2. Objet sélectionné pour suppression:")
    print(f"   📍 Position ID: {position_id}")
    print(f"   🎁 Object ID: {object_id}")
    print(f"   🧩 Component ID: {component_id}")
    
    if 'object' in obj and 'data' in obj['object']:
        data = obj['object']['data']
        if 'name' in data:
            print(f"   📝 Nom: {data['name']}")
        is_background = data.get('VW', {}).get('isBackground', False)
        print(f"   🎨 Élément de fond: {is_background}")
    
    if not position_id:
        print("❌ Impossible de trouver l'ID de la position")
        return
    
    print(f"\n🗑️  3. Tentative de suppression via Socket.IO...")
    
    success = delete_component_socketio_v3(position_id, is_background)
    
    if success:
        print("\n🎉 SUCCÈS! Le composant a été supprimé!")
        
        # Vérifier que l'objet a bien été supprimé
        print("\n🔍 4. Vérification de la suppression...")
        time.sleep(2)
        new_objects = get_board_components()
        if new_objects and len(new_objects) < len(objects):
            print(f"✅ Confirmation: {len(objects)} → {len(new_objects)} objets")
        else:
            print("⚠️  La vérification n'a pas pu confirmer la suppression")
    else:
        print("\n❌ Échec de la suppression automatique.")
        print("\n📝 Solution manuelle:")
        print("1. Ouvrez votre navigateur")
        print(f"2. Allez sur {FRONTEND_URL}/world/{WORLD_ID}/board/{BOARD_ID}")
        print("3. Cliquez sur l'objet à supprimer")
        print("4. Appuyez sur la touche Suppr ou utilisez le menu de suppression")

if __name__ == "__main__":
    main()