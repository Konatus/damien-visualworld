#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CALCULATEUR SIMPLE DE CAPACITÉ PAR JOUR DE LA SEMAINE
"""

import pandas as pd
from datetime import datetime, timedelta

ITERATION_DURATION_DAYS = 15  # ← MODIFIER CETTE VALEUR

def main():
    """
    Calcule la capacité par équipe pour chaque jour de la semaine
    """
    
    # Paramètres
    iteration_duration_ouvert = 1.0
    working_days_ratio = 5/7  # 5 jours ouvrés sur 7
    hours_per_day = 8
    
    working_days = ITERATION_DURATION_DAYS * working_days_ratio
    working_hours = working_days * hours_per_day
    
    # Capacités des équipes
    teams = {
        1: 300,  # ressources 102, 103, 104
        2: 400,  # ressources 202, 203, 204, 205
        3: 700,  # ressources 302, 303, 304, 305, 306, 307, 308
        4: 800,  # ressources 402, 403, 404, 405, 406, 407, 408, 409
        5: 400,  # ressources 502, 503, 504, 505
        6: 800,  # ressources 602, 603, 604, 605, 606, 607, 608, 609
        7: 100   # ressource 610
    }
    
    # Calculer la capacité par équipe
    results = []
    for team_id, total_capacity in teams.items():
        max_load = iteration_duration_ouvert * total_capacity
        calculated_capacity_per_hour = max_load / working_hours
        calculated_capacity_per_day = calculated_capacity_per_hour * hours_per_day
        
        results.append({
            'team_id': team_id,
            'total_capacity': total_capacity,
            'capacity_per_hour': round(calculated_capacity_per_hour, 4),
            'capacity_per_day': round(calculated_capacity_per_day, 2)
        })
    
    # Créer le planning par jour de la semaine
    weekdays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
    weekly_planning = []
    
    for day_name in weekdays:
        is_working_day = day_name not in ['Samedi', 'Dimanche']
        
        for team_result in results:
            team_id = team_result['team_id']
            
            if is_working_day:
                daily_capacity = team_result['capacity_per_day']
                hourly_capacity = team_result['capacity_per_hour']
            else:
                daily_capacity = 0
                hourly_capacity = 0
            
            weekly_planning.append({
                'day_name': day_name,
                'team_id': team_id,
                'is_working_day': is_working_day,
                'daily_capacity': daily_capacity,
                'hourly_capacity': hourly_capacity,
                'total_capacity': team_result['total_capacity']
            })
    
    # Créer Excel
    df_teams = pd.DataFrame(results)
    df_weekly = pd.DataFrame(weekly_planning)
    
    filename = f"capacity_weekly_{ITERATION_DURATION_DAYS}days.xlsx"
    
    with pd.ExcelWriter(filename, engine='openpyxl') as writer:
        df_teams.to_excel(writer, sheet_name='Capacité_Equipes', index=False)
        df_weekly.to_excel(writer, sheet_name='Planning_Semaine', index=False)
        
        # Tableau croisé
        pivot_df = df_weekly.pivot_table(
            index='day_name', 
            columns='team_id', 
            values='daily_capacity', 
            aggfunc='sum'
        )
        pivot_df.to_excel(writer, sheet_name='Tableau_Semaine')
    
    # Afficher résultats
    print(f"=== CAPACITÉ POUR {ITERATION_DURATION_DAYS} JOURS ===")
    print("\n📊 CAPACITÉ PAR ÉQUIPE:")
    for r in results:
        print(f"Équipe {r['team_id']}: {r['capacity_per_hour']} unités/heure ({r['capacity_per_day']} unités/jour)")
    
    print(f"\n📅 PLANNING DE LA SEMAINE:")
    print(f"{'Jour':<10} {'Statut':<8} {'Équipe 1':<10} {'Équipe 2':<10} {'Équipe 3':<10} {'Équipe 4':<10}")
    print("-" * 60)
    
    for day_name in weekdays:
        is_work = day_name not in ['Samedi', 'Dimanche']
        status = "OUVRÉ" if is_work else "FERMÉ"
        
        capacities = []
        for team_id in [1, 2, 3, 4]:
            team_data = next(r for r in results if r['team_id'] == team_id)
            if is_work:
                cap = team_data['capacity_per_day']
            else:
                cap = 0
            capacities.append(f"{cap:.1f}")
        
        print(f"{day_name:<10} {status:<8} {capacities[0]:<10} {capacities[1]:<10} {capacities[2]:<10} {capacities[3]:<10}")
    
    print(f"\n✅ Excel créé: {filename}")
    print(f"📊 Feuilles: Capacité_Equipes, Planning_Semaine, Tableau_Semaine")
    
    return results

if __name__ == "__main__":
    main()



