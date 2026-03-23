#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script simple pour calculer la capacité par équipe avec exemple spécifique
Équipe 1 (ressources 102, 103, 104) = 300% de capacité
"""

def calculate_team_capacity_example():
    """
    Exemple de calcul pour l'équipe 1 avec 300% de capacité
    """
    print("=== EXEMPLE DE CALCUL DE CAPACITÉ ===")
    print("Équipe 1: Ressources 102, 103, 104")
    print()
    
    # Données de l'équipe 1
    team_1_data = [
        {"idressource": 102, "capacityBySkillset": 100},
        {"idressource": 103, "capacityBySkillset": 100},
        {"idressource": 104, "capacityBySkillset": 100}
    ]
    
    # Calculs
    total_capacity = sum(resource["capacityBySkillset"] for resource in team_1_data)
    resource_count = len(team_1_data)
    
    # Paramètres de calcul
    iteration_duration_ouvert = 1.0  # Durée d'ouverture d'itération
    iteration_duration = 1.0  # Durée d'itération modifiée
    
    # Formule: maxLoad = iteration_duration_ouvert * Somme(capacité équipe)
    max_load = iteration_duration_ouvert * total_capacity
    
    # Formule: capacité = maxLoad / iteration_duration
    calculated_capacity = max_load / iteration_duration
    
    # Calcul du pourcentage (exemple: 300%)
    capacity_percentage = (calculated_capacity / total_capacity) * 100
    
    print(f"📊 Capacité totale de l'équipe: {total_capacity}")
    print(f"👥 Nombre de ressources: {resource_count}")
    print(f"⚡ Max Load: {max_load}")
    print(f"🎯 Capacité calculée: {calculated_capacity}")
    print(f"📈 Pourcentage de capacité: {capacity_percentage}%")
    print()
    
    # Array pour l'échange avec la base de données
    team_array = {
        "idteam": 1,
        "resources": [102, 103, 104],
        "total_capacity": total_capacity,
        "calculated_capacity": calculated_capacity,
        "capacity_percentage": capacity_percentage,
        "max_load": max_load
    }
    
    print("=== ARRAY POUR BASE DE DONNÉES ===")
    import json
    print(json.dumps(team_array, indent=2, ensure_ascii=False))
    
    return team_array

def calculate_all_teams():
    """
    Calcule la capacité pour toutes les équipes
    """
    print("\n=== CALCUL POUR TOUTES LES ÉQUIPES ===")
    
    # Données complètes
    all_data = [
        {"id": 1, "idressource": 102, "idteam": 1, "capacityBySkillset": 100},
        {"id": 2, "idressource": 103, "idteam": 1, "capacityBySkillset": 100},
        {"id": 3, "idressource": 104, "idteam": 1, "capacityBySkillset": 100},
        {"id": 4, "idressource": 202, "idteam": 2, "capacityBySkillset": 100},
        {"id": 5, "idressource": 203, "idteam": 2, "capacityBySkillset": 100},
        {"id": 6, "idressource": 204, "idteam": 2, "capacityBySkillset": 100},
        {"id": 7, "idressource": 205, "idteam": 2, "capacityBySkillset": 100},
        {"id": 8, "idressource": 302, "idteam": 3, "capacityBySkillset": 100},
        {"id": 9, "idressource": 303, "idteam": 3, "capacityBySkillset": 100},
        {"id": 10, "idressource": 304, "idteam": 3, "capacityBySkillset": 100},
        {"id": 11, "idressource": 305, "idteam": 3, "capacityBySkillset": 100},
        {"id": 12, "idressource": 306, "idteam": 3, "capacityBySkillset": 100},
        {"id": 13, "idressource": 307, "idteam": 3, "capacityBySkillset": 100},
        {"id": 14, "idressource": 308, "idteam": 3, "capacityBySkillset": 100},
        {"id": 15, "idressource": 402, "idteam": 4, "capacityBySkillset": 100},
        {"id": 16, "idressource": 403, "idteam": 4, "capacityBySkillset": 100},
        {"id": 17, "idressource": 404, "idteam": 4, "capacityBySkillset": 100},
        {"id": 18, "idressource": 405, "idteam": 4, "capacityBySkillset": 100},
        {"id": 19, "idressource": 406, "idteam": 4, "capacityBySkillset": 100},
        {"id": 20, "idressource": 407, "idteam": 4, "capacityBySkillset": 100},
        {"id": 21, "idressource": 408, "idteam": 4, "capacityBySkillset": 100},
        {"id": 22, "idressource": 409, "idteam": 4, "capacityBySkillset": 100},
        {"id": 23, "idressource": 502, "idteam": 5, "capacityBySkillset": 100},
        {"id": 24, "idressource": 503, "idteam": 5, "capacityBySkillset": 100},
        {"id": 25, "idressource": 504, "idteam": 5, "capacityBySkillset": 100},
        {"id": 26, "idressource": 505, "idteam": 5, "capacityBySkillset": 100},
        {"id": 27, "idressource": 602, "idteam": 6, "capacityBySkillset": 100},
        {"id": 28, "idressource": 603, "idteam": 6, "capacityBySkillset": 100},
        {"id": 29, "idressource": 604, "idteam": 6, "capacityBySkillset": 100},
        {"id": 30, "idressource": 605, "idteam": 6, "capacityBySkillset": 100},
        {"id": 31, "idressource": 606, "idteam": 6, "capacityBySkillset": 100},
        {"id": 32, "idressource": 607, "idteam": 6, "capacityBySkillset": 100},
        {"id": 33, "idressource": 608, "idteam": 6, "capacityBySkillset": 100},
        {"id": 34, "idressource": 609, "idteam": 6, "capacityBySkillset": 100},
        {"id": 35, "idressource": 610, "idteam": 7, "capacityBySkillset": 100},
    ]
    
    # Grouper par équipe
    teams = {}
    for item in all_data:
        team_id = item["idteam"]
        if team_id not in teams:
            teams[team_id] = []
        teams[team_id].append(item)
    
    # Calculer pour chaque équipe
    results = []
    for team_id, team_data in teams.items():
        total_capacity = sum(resource["capacityBySkillset"] for resource in team_data)
        resource_count = len(team_data)
        resources = [resource["idressource"] for resource in team_data]
        
        # Calculs selon la formule
        iteration_duration_ouvert = 1.0
        iteration_duration = 1.0
        max_load = iteration_duration_ouvert * total_capacity
        calculated_capacity = max_load / iteration_duration
        capacity_percentage = (calculated_capacity / total_capacity) * 100
        
        result = {
            "idteam": team_id,
            "resources": resources,
            "total_capacity": total_capacity,
            "calculated_capacity": calculated_capacity,
            "capacity_percentage": capacity_percentage,
            "max_load": max_load,
            "resource_count": resource_count
        }
        
        results.append(result)
        
        print(f"Équipe {team_id}: {resource_count} ressources, Capacité: {total_capacity}, Calculée: {calculated_capacity}")
    
    print("\n=== ARRAY COMPLET POUR BASE DE DONNÉES ===")
    import json
    print(json.dumps(results, indent=2, ensure_ascii=False))
    
    return results

if __name__ == "__main__":
    # Exemple spécifique pour l'équipe 1
    calculate_team_capacity_example()
    
    # Calcul pour toutes les équipes
    calculate_all_teams()
