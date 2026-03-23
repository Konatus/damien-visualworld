#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de test pour l'API d'export Excel
Teste le nouvel endpoint /api/board-export-excel
"""

import requests
import json
import os
from datetime import datetime

# Configuration
WORLD_ID = "68932ca97baa671b9427c55f"  # Remplacez par votre worldId
BOARD_ID = "68a5ad99a7a68e06dca31859"  # Remplacez par votre boardId
API_BASE_URL = "http://localhost:8080"  # URL de votre API Visual World

def test_excel_export_api():
    """
    Teste l'API d'export Excel
    """
    print("🚀 TEST DE L'API D'EXPORT EXCEL")
    print("=" * 50)
    
    # URL de l'endpoint
    url = f"{API_BASE_URL}/api/board-export-excel"
    params = {
        "worldId": WORLD_ID,
        "boardId": BOARD_ID
    }
    
    print(f"📡 Appel API: {url}")
    print(f"📋 Paramètres: {params}")
    print()
    
    try:
        # Faire l'appel API
        print("⏳ Envoi de la requête...")
        response = requests.get(url, params=params, timeout=30)
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📏 Content Length: {len(response.content)} bytes")
        print(f"📄 Content Type: {response.headers.get('Content-Type', 'Non spécifié')}")
        print()
        
        if response.status_code == 200:
            # Sauvegarder le fichier Excel
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"board_export_{BOARD_ID}_{timestamp}.xlsx"
            
            with open(filename, 'wb') as f:
                f.write(response.content)
            
            print(f"✅ SUCCÈS ! Fichier Excel créé: {filename}")
            print(f"📁 Taille du fichier: {len(response.content)} bytes")
            
            # Vérifier que c'est bien un fichier Excel
            if response.content.startswith(b'PK'):
                print("✅ Format Excel valide détecté (signature PK)")
            else:
                print("⚠️  Format Excel suspect")
                
        else:
            print(f"❌ ERREUR: {response.status_code}")
            try:
                error_data = response.json()
                print(f"📝 Détails: {json.dumps(error_data, indent=2)}")
            except:
                print(f"📝 Réponse brute: {response.text}")
                
    except requests.exceptions.Timeout:
        print("❌ TIMEOUT: La requête a pris trop de temps")
    except requests.exceptions.ConnectionError:
        print("❌ CONNEXION: Impossible de se connecter à l'API")
        print(f"💡 Vérifiez que l'API Visual World est démarrée sur {API_BASE_URL}")
    except Exception as e:
        print(f"❌ ERREUR INATTENDUE: {e}")

def test_api_availability():
    """
    Teste si l'API est disponible
    """
    print("🔍 VÉRIFICATION DE LA DISPONIBILITÉ DE L'API")
    print("-" * 40)
    
    try:
        # Test simple de l'API board-io existante
        url = f"{API_BASE_URL}/api/board-io"
        params = {
            "worldId": WORLD_ID,
            "boardId": BOARD_ID
        }
        
        response = requests.get(url, params=params, timeout=5)
        print(f"📡 API board-io: Status {response.status_code}")
        
        if response.status_code == 200:
            print("✅ API Visual World disponible")
            return True
        else:
            print("⚠️  API Visual World répond mais avec erreur")
            return False
            
    except Exception as e:
        print(f"❌ API Visual World non disponible: {e}")
        return False

def main():
    """
    Fonction principale
    """
    print("🎯 TESTEUR D'EXPORT EXCEL - VISUAL WORLD API")
    print("=" * 60)
    print()
    
    # Vérifier la disponibilité de l'API
    if not test_api_availability():
        print()
        print("💡 SOLUTIONS POSSIBLES:")
        print("   1. Démarrer l'API Visual World: cd api && npm start")
        print("   2. Vérifier l'URL dans ce script")
        print("   3. Vérifier les IDs worldId et boardId")
        return
    
    print()
    
    # Tester l'export Excel
    test_excel_export_api()
    
    print()
    print("🏁 Test terminé")

if __name__ == "__main__":
    main()
