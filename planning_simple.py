#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MODÈLE DE DONNÉES: team_ressources
PLANNING: 24/10 + 15 jours avec working days
"""

import pandas as pd
from datetime import datetime, timedelta

# ⚠️ VARIABLES À MODIFIER
START_DATE = "2024-10-24"  # ← Date de début
ITERATION_DAYS = 15  # ← Durée en jours

def main():
    """
    Génère le planning basé sur le modèle team_ressources
    """
    
    # Modèle de données: team_ressources (SELECT * FROM public.team_ressources)
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
    df = pd.DataFrame(team_ressources)
    
    # Calculer les capacités par équipe
    team_capacities = df.groupby('idteam').agg({
        'capacityBySkillset': 'sum',
        'idressource': lambda x: list(x)
    }).reset_index()
    
    team_capacities.columns = ['idteam', 'total_capacity', 'resources']
    
    # Paramètres de calcul
    working_days_ratio = 5/7  # 5 jours ouvrés sur 7
    hours_per_day = 8
    working_days = ITERATION_DAYS * working_days_ratio
    working_hours = working_days * hours_per_day
    
    # Générer les dates
    start_date = datetime.strptime(START_DATE, "%Y-%m-%d").date()
    end_date = start_date + timedelta(days=ITERATION_DAYS - 1)
    
    # Créer le planning quotidien
    planning = []
    
    for day_offset in range(ITERATION_DAYS):
        current_date = start_date + timedelta(days=day_offset)
        day_of_week = current_date.weekday()  # 0=Lundi, 6=Dimanche
        weekdays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
        day_name = weekdays[day_of_week]
        is_working_day = day_of_week < 5
        
        for _, team in team_capacities.iterrows():
            team_id = team['idteam']
            total_capacity = team['total_capacity']
            
            # Formule: capacité = maxLoad / iteration_duration
            max_load = total_capacity  # iteration_duration_ouvert = 1
            
            if is_working_day:
                hourly_capacity = max_load / working_hours
                daily_capacity = hourly_capacity * hours_per_day
            else:
                hourly_capacity = 0
                daily_capacity = 0
            
            planning.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'day_name': day_name,
                'team_id': team_id,
                'is_working_day': is_working_day,
                'daily_capacity': round(daily_capacity, 2),
                'hourly_capacity': round(hourly_capacity, 4)
            })
    
    # Créer Excel
    df_planning = pd.DataFrame(planning)
    filename = f"planning_{START_DATE}_plus_{ITERATION_DAYS}days.xlsx"
    
    with pd.ExcelWriter(filename, engine='openpyxl') as writer:
        df_planning.to_excel(writer, sheet_name='Planning', index=False)
        df.to_excel(writer, sheet_name='Modele_Donnees', index=False)
    
    # Afficher résultats
    print(f"=== PLANNING {START_DATE} + {ITERATION_DAYS} JOURS ===")
    print(f"📅 Période: {start_date} → {end_date}")
    print(f"📊 Jours ouvrés: {round(working_days, 1)} jours")
    print()
    
    print("📋 CAPACITÉ PAR ÉQUIPE:")
    for _, team in team_capacities.iterrows():
        team_id = team['idteam']
        total_cap = team['total_capacity']
        hourly_cap = total_cap / working_hours
        daily_cap = hourly_cap * hours_per_day
        print(f"Équipe {team_id}: {round(hourly_cap, 4)} unités/heure ({round(daily_cap, 2)} unités/jour)")
    
    print(f"\n📅 PLANNING QUOTIDIEN (premiers jours):")
    for i, row in df_planning.head(14).iterrows():
        status = "OUVRÉ" if row['is_working_day'] else "FERMÉ"
        print(f"{row['date']} ({row['day_name']}) - Équipe {row['team_id']}: {row['daily_capacity']} unités [{status}]")
    
    print(f"\n✅ Excel créé: {filename}")
    
    return df_planning

if __name__ == "__main__":
    main()



