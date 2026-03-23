#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CALCULATEUR DE CAPACITÉ PAR ÉQUIPE ET PAR JOUR DE LA SEMAINE
Formule: capacité = maxLoad / iteration_duration
"""

import pandas as pd
from datetime import datetime, timedelta

ITERATION_DURATION_DAYS = 15  # ← MODIFIER CETTE VALEUR

def main():
    """
    Calcule la capacité par équipe et par jour de la semaine
    """
    
    iteration_duration_ouvert = 1.0
    working_days_ratio = 5/7  # 5 jours ouvrés sur 7
    hours_per_day = 8
    
    working_days = ITERATION_DURATION_DAYS * working_days_ratio
    working_hours = working_days * hours_per_day
    
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
    team_results = []
    for team_id, total_capacity in teams.items():
        max_load = iteration_duration_ouvert * total_capacity
        calculated_capacity_per_hour = max_load / working_hours
        calculated_capacity_per_day = calculated_capacity_per_hour * hours_per_day
        
        team_results.append({
            'team_id': team_id,
            'total_capacity': total_capacity,
            'capacity_per_hour': round(calculated_capacity_per_hour, 4),
            'capacity_per_day': round(calculated_capacity_per_day, 2)
        })
    
    # Générer les dates pour chaque jour de la semaine
    start_date = datetime.now().date()
    daily_results = []
    
    # Jours de la semaine (0=Lundi, 6=Dimanche)
    weekdays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
    
    for day_offset in range(ITERATION_DURATION_DAYS):
        current_date = start_date + timedelta(days=day_offset)
        day_of_week = current_date.weekday()  # 0=Lundi, 6=Dimanche
        day_name = weekdays[day_of_week]
        is_working_day = day_of_week < 5  # Lundi à Vendredi
        
        for team_result in team_results:
            team_id = team_result['team_id']
            
            if is_working_day:
                # Jour ouvré : capacité normale
                daily_capacity = team_result['capacity_per_day']
                hourly_capacity = team_result['capacity_per_hour']
            else:
                # Week-end : capacité = 0
                daily_capacity = 0
                hourly_capacity = 0
            
            daily_results.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'day_name': day_name,
                'team_id': team_id,
                'is_working_day': is_working_day,
                'daily_capacity': daily_capacity,
                'hourly_capacity': hourly_capacity,
                'total_capacity': team_result['total_capacity']
            })
    
    # Créer les DataFrames
    team_df = pd.DataFrame(team_results)
    daily_df = pd.DataFrame(daily_results)
    
    # Créer Excel avec plusieurs feuilles
    filename = f"capacity_daily_{ITERATION_DURATION_DAYS}days.xlsx"
    
    with pd.ExcelWriter(filename, engine='openpyxl') as writer:
        # Feuille 1: Résumé par équipe
        team_df.to_excel(writer, sheet_name='Résumé_Equipes', index=False)
        
        # Feuille 2: Capacité par jour
        daily_df.to_excel(writer, sheet_name='Capacité_Quotidienne', index=False)
        
        # Feuille 3: Capacité par jour de la semaine (pivot)
        pivot_df = daily_df.pivot_table(
            index=['date', 'day_name'], 
            columns='team_id', 
            values='daily_capacity', 
            aggfunc='sum'
        )
        pivot_df.to_excel(writer, sheet_name='Planning_Jours')
        
        # Feuille 4: Résumé par jour de la semaine
        weekly_summary = daily_df.groupby('day_name').agg({
            'daily_capacity': 'sum',
            'is_working_day': 'first'
        }).reset_index()
        weekly_summary.to_excel(writer, sheet_name='Résumé_Semaine', index=False)
    
    # Afficher résultats
    print(f"=== CAPACITÉ POUR {ITERATION_DURATION_DAYS} JOURS ===")
    print("\n📊 RÉSUMÉ PAR ÉQUIPE:")
    for r in team_results:
        print(f"Équipe {r['team_id']}: {r['capacity_per_hour']} unités/heure ({r['capacity_per_day']} unités/jour)")
    
    print(f"\n📅 JOURS DE LA SEMAINE:")
    for day in weekdays:
        is_work = day not in ['Samedi', 'Dimanche']
        status = "OUVRÉ" if is_work else "FERMÉ"
        print(f"{day}: {status}")
    
    print(f"\n✅ Excel créé: {filename}")
    print(f"📊 Feuilles: Résumé_Equipes, Capacité_Quotidienne, Planning_Jours, Résumé_Semaine")
    
    return team_results, daily_results

if __name__ == "__main__":
    main()

