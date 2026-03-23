#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PLANNING DE CAPACITÉ AVEC DATES RÉELLES
Modèle de données: team_ressources
Date de planification: 24/10 + 15 jours
"""

import pandas as pd
from datetime import datetime, timedelta

# ⚠️ VARIABLES À MODIFIER
START_DATE = "2024-10-24"  # ← Date de début de planification
ITERATION_DURATION_DAYS = 15  # ← Durée en jours

def main():
    """
    Génère un planning de capacité avec dates réelles
    """
    
    # Paramètres de calcul
    iteration_duration_ouvert = 1.0
    working_days_ratio = 5/7  # 5 jours ouvrés sur 7
    hours_per_day = 8
    
    # Calculer les heures ouvrées totales
    working_days = ITERATION_DURATION_DAYS * working_days_ratio
    working_hours = working_days * hours_per_day
    
    # Modèle de données: team_ressources
    team_ressources = [
        {"id": 1, "idressource": 102, "idteam": 1, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 2, "idressource": 103, "idteam": 1, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 3, "idressource": 104, "idteam": 1, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 4, "idressource": 202, "idteam": 2, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 5, "idressource": 203, "idteam": 2, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 6, "idressource": 204, "idteam": 2, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 7, "idressource": 205, "idteam": 2, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 8, "idressource": 302, "idteam": 3, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 9, "idressource": 303, "idteam": 3, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 10, "idressource": 304, "idteam": 3, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 11, "idressource": 305, "idteam": 3, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 12, "idressource": 306, "idteam": 3, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 13, "idressource": 307, "idteam": 3, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 14, "idressource": 308, "idteam": 3, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 15, "idressource": 402, "idteam": 4, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 16, "idressource": 403, "idteam": 4, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 17, "idressource": 404, "idteam": 4, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 18, "idressource": 405, "idteam": 4, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 19, "idressource": 406, "idteam": 4, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 20, "idressource": 407, "idteam": 4, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 21, "idressource": 408, "idteam": 4, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 22, "idressource": 409, "idteam": 4, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 23, "idressource": 502, "idteam": 5, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 24, "idressource": 503, "idteam": 5, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 25, "idressource": 504, "idteam": 5, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 26, "idressource": 505, "idteam": 5, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 27, "idressource": 602, "idteam": 6, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 28, "idressource": 603, "idteam": 6, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 29, "idressource": 604, "idteam": 6, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 30, "idressource": 605, "idteam": 6, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 31, "idressource": 606, "idteam": 6, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 32, "idressource": 607, "idteam": 6, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 33, "idressource": 608, "idteam": 6, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 34, "idressource": 609, "idteam": 6, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
        {"id": 35, "idressource": 610, "idteam": 7, "idskillseet": 0, "idActivitSkill": 1, "capacityBySkillset": 100},
    ]
    
    # Convertir en DataFrame
    df_team_ressources = pd.DataFrame(team_ressources)
    
    # Calculer les capacités par équipe
    team_capacities = df_team_ressources.groupby('idteam').agg({
        'capacityBySkillset': 'sum',
        'idressource': lambda x: list(x)
    }).reset_index()
    
    team_capacities.columns = ['idteam', 'total_capacity', 'resources']
    
    # Générer les dates de planification
    start_date = datetime.strptime(START_DATE, "%Y-%m-%d").date()
    end_date = start_date + timedelta(days=ITERATION_DURATION_DAYS - 1)
    
    # Créer le planning détaillé
    planning_data = []
    
    for day_offset in range(ITERATION_DURATION_DAYS):
        current_date = start_date + timedelta(days=day_offset)
        day_of_week = current_date.weekday()  # 0=Lundi, 6=Dimanche
        weekdays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
        day_name = weekdays[day_of_week]
        is_working_day = day_of_week < 5  # Lundi à Vendredi
        
        for _, team in team_capacities.iterrows():
            team_id = int(team['idteam'])
            total_capacity = int(team['total_capacity'])
            resources = team['resources']
            
            # Calculer la capacité selon la formule
            max_load = iteration_duration_ouvert * total_capacity
            
            if is_working_day:
                # Jour ouvré : capacité normale
                hourly_capacity = max_load / working_hours
                daily_capacity = hourly_capacity * hours_per_day
            else:
                # Week-end : capacité = 0
                hourly_capacity = 0
                daily_capacity = 0
            
            planning_data.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'day_name': day_name,
                'team_id': team_id,
                'resources': ', '.join(map(str, resources)),
                'total_capacity': total_capacity,
                'is_working_day': is_working_day,
                'hourly_capacity': round(hourly_capacity, 4),
                'daily_capacity': round(daily_capacity, 2),
                'max_load': max_load
            })
    
    # Créer les DataFrames
    df_planning = pd.DataFrame(planning_data)
    df_team_ressources.to_excel('team_ressources_model.xlsx', index=False)
    
    # Créer le fichier Excel principal
    filename = f"planning_capacity_{START_DATE}_plus_{ITERATION_DURATION_DAYS}days.xlsx"
    
    with pd.ExcelWriter(filename, engine='openpyxl') as writer:
        # Feuille 1: Planning détaillé
        df_planning.to_excel(writer, sheet_name='Planning_Detaille', index=False)
        
        # Feuille 2: Résumé par équipe
        team_summary = df_planning.groupby('team_id').agg({
            'total_capacity': 'first',
            'resources': 'first',
            'daily_capacity': 'sum',
            'hourly_capacity': 'first'
        }).reset_index()
        team_summary.to_excel(writer, sheet_name='Resume_Equipes', index=False)
        
        # Feuille 3: Planning par jour (pivot)
        pivot_df = df_planning.pivot_table(
            index=['date', 'day_name'], 
            columns='team_id', 
            values='daily_capacity', 
            aggfunc='sum'
        )
        pivot_df.to_excel(writer, sheet_name='Planning_Jours')
        
        # Feuille 4: Modèle de données original
        df_team_ressources.to_excel(writer, sheet_name='Modele_Donnees', index=False)
        
        # Feuille 5: Statistiques
        stats_data = {
            'Métrique': [
                'Date de début',
                'Date de fin',
                'Durée totale (jours)',
                'Jours ouvrés',
                'Jours fermés',
                'Heures ouvrées totales',
                'Nombre d\'équipes',
                'Capacité totale'
            ],
            'Valeur': [
                START_DATE,
                end_date.strftime('%Y-%m-%d'),
                ITERATION_DURATION_DAYS,
                round(working_days, 1),
                ITERATION_DURATION_DAYS - round(working_days, 1),
                working_hours,
                len(team_capacities),
                team_capacities['total_capacity'].sum()
            ]
        }
        df_stats = pd.DataFrame(stats_data)
        df_stats.to_excel(writer, sheet_name='Statistiques', index=False)
    
    # Afficher les résultats
    print(f"=== PLANNING DE CAPACITÉ ===")
    print(f"📅 Période: {START_DATE} → {end_date.strftime('%Y-%m-%d')} ({ITERATION_DURATION_DAYS} jours)")
    print(f"📊 Jours ouvrés: {round(working_days, 1)} jours")
    print(f"⏰ Heures ouvrées: {working_hours} heures")
    print()
    
    print("📋 CAPACITÉ PAR ÉQUIPE:")
    for _, team in team_capacities.iterrows():
        team_id = team['idteam']
        total_cap = team['total_capacity']
        hourly_cap = total_cap / working_hours
        daily_cap = hourly_cap * hours_per_day
        print(f"Équipe {team_id}: {round(hourly_cap, 4)} unités/heure ({round(daily_cap, 2)} unités/jour)")
    
    print(f"\n✅ Fichiers créés:")
    print(f"   • {filename} (planning principal)")
    print(f"   • team_ressources_model.xlsx (modèle de données)")
    print(f"📊 Feuilles Excel: Planning_Detaille, Resume_Equipes, Planning_Jours, Modele_Donnees, Statistiques")
    
    return df_planning

if __name__ == "__main__":
    main()



