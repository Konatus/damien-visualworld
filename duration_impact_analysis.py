#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Comparaison de l'impact de différentes durées d'itération sur le calcul de capacité
"""

def calculate_capacity_with_duration(iteration_duration_days: float):
    """
    Calcule la capacité avec une durée d'itération spécifique
    
    Args:
        iteration_duration_days: Durée d'itération en jours
    """
    print(f"\n=== CALCUL AVEC DURÉE D'ITÉRATION DE {iteration_duration_days} JOURS ===")
    
    # Données de l'équipe 1 (exemple)
    team_1_data = [
        {"idressource": 102, "capacityBySkillset": 100},
        {"idressource": 103, "capacityBySkillset": 100},
        {"idressource": 104, "capacityBySkillset": 100}
    ]
    
    # Calculs
    total_capacity = sum(resource["capacityBySkillset"] for resource in team_1_data)
    resource_count = len(team_1_data)
    
    # Paramètres de calcul
    iteration_duration_ouvert = 1.0  # Durée d'ouverture d'itération (en jours)
    iteration_duration_hours = iteration_duration_days * 24  # Convertir en heures
    
    # Formule: maxLoad = iteration_duration_ouvert * Somme(capacité équipe)
    max_load = iteration_duration_ouvert * total_capacity
    
    # Formule: capacité = maxLoad / iteration_duration (en heures)
    calculated_capacity = max_load / iteration_duration_hours
    
    # Calcul du pourcentage
    capacity_percentage = (calculated_capacity / total_capacity) * 100
    
    print(f"📊 Capacité totale de l'équipe: {total_capacity}")
    print(f"👥 Nombre de ressources: {resource_count}")
    print(f"⚡ Max Load: {max_load}")
    print(f"🕐 Durée d'itération: {iteration_duration_days} jours ({iteration_duration_hours} heures)")
    print(f"🎯 Capacité calculée: {calculated_capacity:.4f}")
    print(f"📈 Pourcentage de capacité: {capacity_percentage:.4f}%")
    
    return {
        "iteration_duration_days": iteration_duration_days,
        "iteration_duration_hours": iteration_duration_hours,
        "total_capacity": total_capacity,
        "max_load": max_load,
        "calculated_capacity": calculated_capacity,
        "capacity_percentage": capacity_percentage
    }

def compare_durations():
    """
    Compare différentes durées d'itération
    """
    print("=== COMPARAISON DE DIFFÉRENTES DURÉES D'ITÉRATION ===")
    print("Équipe 1: Ressources 102, 103, 104 (capacité totale: 300)")
    print()
    
    # Différentes durées à tester
    durations = [1/24, 1, 7, 15, 30]  # 1 heure, 1 jour, 1 semaine, 15 jours, 1 mois
    
    results = []
    
    for duration in durations:
        result = calculate_capacity_with_duration(duration)
        results.append(result)
    
    # Tableau de comparaison
    print("\n=== TABLEAU DE COMPARAISON ===")
    print(f"{'Durée':<15} {'Heures':<8} {'Capacité Calculée':<18} {'Pourcentage':<12}")
    print("-" * 60)
    
    for result in results:
        duration_str = f"{result['iteration_duration_days']:.1f} jour(s)" if result['iteration_duration_days'] >= 1 else f"{result['iteration_duration_hours']:.1f} heure(s)"
        print(f"{duration_str:<15} {result['iteration_duration_hours']:<8.1f} {result['calculated_capacity']:<18.4f} {result['capacity_percentage']:<12.4f}%")
    
    return results

def analyze_impact():
    """
    Analyse l'impact de la durée d'itération
    """
    print("\n=== ANALYSE DE L'IMPACT ===")
    
    # Calcul avec 1 heure
    result_1h = calculate_capacity_with_duration(1/24)
    
    # Calcul avec 15 jours
    result_15d = calculate_capacity_with_duration(15)
    
    # Calculer la différence
    capacity_ratio = result_15d['calculated_capacity'] / result_1h['calculated_capacity']
    
    print(f"\n🔍 ANALYSE:")
    print(f"   • Avec 1 heure: Capacité = {result_1h['calculated_capacity']:.4f}")
    print(f"   • Avec 15 jours: Capacité = {result_15d['calculated_capacity']:.4f}")
    print(f"   • Ratio: {capacity_ratio:.6f} (la capacité est divisée par {1/capacity_ratio:.0f})")
    print(f"   • Impact: La capacité diminue de {((1-capacity_ratio)*100):.2f}%")
    
    print(f"\n💡 INTERPRÉTATION:")
    print(f"   • Plus la durée d'itération est longue, plus la capacité calculée diminue")
    print(f"   • Avec 15 jours, l'équipe peut traiter {result_15d['calculated_capacity']:.4f} unités par heure")
    print(f"   • Sur 15 jours, l'équipe peut traiter {result_15d['calculated_capacity'] * 24 * 15:.0f} unités au total")

def practical_example():
    """
    Exemple pratique avec 15 jours
    """
    print("\n=== EXEMPLE PRATIQUE AVEC 15 JOURS ===")
    
    # Données complètes pour toutes les équipes
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
    ]
    
    # Grouper par équipe
    teams = {}
    for item in all_data:
        team_id = item["idteam"]
        if team_id not in teams:
            teams[team_id] = []
        teams[team_id].append(item)
    
    iteration_duration_days = 15
    iteration_duration_hours = iteration_duration_days * 24
    
    print(f"Durée d'itération: {iteration_duration_days} jours ({iteration_duration_hours} heures)")
    print()
    
    results = []
    for team_id, team_data in teams.items():
        total_capacity = sum(resource["capacityBySkillset"] for resource in team_data)
        resource_count = len(team_data)
        resources = [resource["idressource"] for resource in team_data]
        
        # Calculs selon la formule
        iteration_duration_ouvert = 1.0
        max_load = iteration_duration_ouvert * total_capacity
        calculated_capacity = max_load / iteration_duration_hours
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
        
        print(f"Équipe {team_id}: {resource_count} ressources, Capacité: {total_capacity}, Calculée: {calculated_capacity:.4f}")
    
    print("\n=== ARRAY POUR BASE DE DONNÉES (15 JOURS) ===")
    import json
    print(json.dumps(results, indent=2, ensure_ascii=False))
    
    return results

if __name__ == "__main__":
    # Comparaison de différentes durées
    compare_durations()
    
    # Analyse de l'impact
    analyze_impact()
    
    # Exemple pratique avec 15 jours
    practical_example()
