#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script simple pour calculer la capacité par équipe
Formule: capacité = maxLoad / iteration_duration
Où maxLoad = iteration_duration_ouvert * Somme(capacité équipe)
"""

import pandas as pd
from datetime import datetime

def calculate_team_capacity(iteration_duration_days):
    """
    Calcule la capacité par équipe pour une durée d'itération donnée
    
    Args:
        iteration_duration_days: Durée d'itération en jours (variable à modifier)
    """
    
    # VARIABLE À MODIFIER - Durée d'itération
    iteration_duration = iteration_duration_days  # jours
    
    # Paramètres fixes
    iteration_duration_ouvert = 1.0  # Durée d'ouverture d'itération
    working_days_ratio = 5/7  # 5 jours ouvrés sur 7
    hours_per_day = 8  # 8 heures par jour ouvré
    
    # Calculer les heures ouvrées pour cette durée
    working_days = iteration_duration * working_days_ratio
    working_hours = working_days * hours_per_day
    
    # Données des équipes (capacité totale par équipe)
    team_capacities = {
        1: 300,  # Équipe 1: ressources 102, 103, 104
        2: 400,  # Équipe 2: ressources 202, 203, 204, 205
        3: 700,  # Équipe 3: ressources 302, 303, 304, 305, 306, 307, 308
        4: 800,  # Équipe 4: ressources 402, 403, 404, 405, 406, 407, 408, 409
        5: 400,  # Équipe 5: ressources 502, 503, 504, 505
        6: 800,  # Équipe 6: ressources 602, 603, 604, 605, 606, 607, 608, 609
        7: 100   # Équipe 7: ressource 610
    }
    
    # Calculer la capacité pour chaque équipe
    results = []
    
    for team_id, total_capacity in team_capacities.items():
        # maxLoad = iteration_duration_ouvert * Somme(capacité équipe)
        max_load = iteration_duration_ouvert * total_capacity
        
        # capacité = maxLoad / iteration_duration (en heures ouvrées)
        calculated_capacity = max_load / working_hours
        
        results.append({
            'ID_Equipe': team_id,
            'Capacité_Totale': total_capacity,
            'Max_Load': max_load,
            'Durée_Itération_Jours': iteration_duration,
            'Heures_Ouvrées': working_hours,
            'Capacité_Calculée': round(calculated_capacity, 4)
        })
    
    return results

def create_excel_report(iteration_duration_days):
    """
    Crée un fichier Excel avec les résultats
    
    Args:
        iteration_duration_days: Durée d'itération en jours
    """
    
    # Calculer les capacités
    results = calculate_team_capacity(iteration_duration_days)
    
    # Créer le DataFrame
    df = pd.DataFrame(results)
    
    # Nom du fichier avec timestamp
    filename = f"capacity_iteration_{iteration_duration_days}days_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    
    # Créer le fichier Excel
    with pd.ExcelWriter(filename, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Capacité_Equipes', index=False)
    
    print(f"✅ Fichier Excel créé: {filename}")
    print(f"📊 Durée d'itération: {iteration_duration_days} jours")
    print(f"📈 Nombre d'équipes: {len(results)}")
    print()
    
    # Afficher les résultats
    print("=== RÉSULTATS ===")
    for result in results:
        print(f"Équipe {result['ID_Equipe']}: {result['Capacité_Calculée']} unités/heure")
    
    return filename, results

def main():
    """
    Fonction principale - MODIFIER LA VARIABLE ICI
    """
    
    # ⚠️ VARIABLE À MODIFIER - Changer cette valeur selon vos besoins
    iteration_duration_days = 15  # ← MODIFIER CETTE VALEUR
    
    print("=== CALCULATEUR DE CAPACITÉ PAR ÉQUIPE ===")
    print(f"🕐 Durée d'itération: {iteration_duration_days} jours")
    print("📅 Prise en compte: 5 jours ouvrés sur 7 (8h/jour)")
    print()
    
    # Créer le rapport Excel
    filename, results = create_excel_report(iteration_duration_days)
    
    # Afficher le résumé
    total_capacity = sum(r['Capacité_Totale'] for r in results)
    total_calculated = sum(r['Capacité_Calculée'] for r in results)
    
    print("=== RÉSUMÉ ===")
    print(f"📊 Capacité totale toutes équipes: {total_capacity}")
    print(f"🎯 Capacité calculée totale: {total_calculated:.4f} unités/heure")
    print(f"📁 Fichier Excel: {filename}")
    
    return results

if __name__ == "__main__":
    main()
