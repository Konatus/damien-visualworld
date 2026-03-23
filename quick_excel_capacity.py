#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script rapide pour calculer et stocker la capacité par équipe dans Excel
Avec prise en compte des jours ouvrés (5/7)
"""

import pandas as pd
from datetime import datetime

def quick_capacity_calculation():
    """
    Calcul rapide de la capacité avec jours ouvrés
    """
    print("🚀 CALCUL RAPIDE DE CAPACITÉ AVEC JOURS OUVRÉS")
    print("=" * 50)
    
    # Données de la table team_ressources
    data = [
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
    
    df = pd.DataFrame(data)
    
    # Paramètres
    working_days_ratio = 5/7  # 5 jours ouvrés sur 7
    hours_per_day = 8  # 8 heures par jour ouvré
    
    # Durées d'itération à tester
    durations = [1, 7, 15, 30]
    
    # Créer le fichier Excel
    filename = f"capacity_calculation_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    
    with pd.ExcelWriter(filename, engine='openpyxl') as writer:
        
        # Feuille principale avec tous les calculs
        all_results = []
        
        for duration in durations:
            print(f"📊 Calcul pour {duration} jour(s)...")
            
            # Calculer les jours ouvrés
            working_days = duration * working_days_ratio
            working_hours = working_days * hours_per_day
            
            # Grouper par équipe
            team_stats = df.groupby('idteam').agg({
                'capacityBySkillset': 'sum',
                'idressource': lambda x: list(x)
            }).reset_index()
            
            team_stats.columns = ['idteam', 'total_capacity', 'resources']
            
            for _, row in team_stats.iterrows():
                team_id = int(row['idteam'])
                total_capacity = int(row['total_capacity'])
                resources = row['resources']
                
                # Formule: capacité = maxLoad / iteration_duration
                max_load = total_capacity  # iteration_duration_ouvert = 1
                capacity_per_hour = max_load / working_hours
                capacity_per_day = capacity_per_hour * hours_per_day
                
                result = {
                    'Durée_Jours': duration,
                    'ID_Equipe': team_id,
                    'Ressources': ', '.join(map(str, resources)),
                    'Capacité_Totale': total_capacity,
                    'Jours_Ouvrés': round(working_days, 2),
                    'Heures_Ouvrées': working_hours,
                    'Capacité_Heure': round(capacity_per_hour, 4),
                    'Capacité_Jour': round(capacity_per_day, 2),
                    'Capacité_Période': round(capacity_per_hour * working_hours, 2),
                    'Pourcentage': round((capacity_per_hour / total_capacity) * 100, 4)
                }
                
                all_results.append(result)
                
                if team_id == 1:  # Afficher seulement l'équipe 1
                    print(f"   ✅ Équipe {team_id}: {capacity_per_hour:.4f} unités/heure")
        
        # Créer le DataFrame principal
        results_df = pd.DataFrame(all_results)
        results_df.to_excel(writer, sheet_name='Calculs_Capacité', index=False)
        
        # Feuille de résumé par équipe
        summary_data = []
        for team_id in sorted(df['idteam'].unique()):
            team_data = df[df['idteam'] == team_id]
            total_capacity = team_data['capacityBySkillset'].sum()
            resource_count = len(team_data)
            resources = team_data['idressource'].tolist()
            
            summary_data.append({
                'ID_Equipe': team_id,
                'Nb_Ressources': resource_count,
                'Ressources': ', '.join(map(str, resources)),
                'Capacité_Totale': total_capacity,
                'Capacité_Moyenne_Ressource': round(total_capacity / resource_count, 2)
            })
        
        summary_df = pd.DataFrame(summary_data)
        summary_df.to_excel(writer, sheet_name='Résumé_Equipes', index=False)
        
        # Feuille des données brutes
        df.to_excel(writer, sheet_name='Données_Brutes', index=False)
        
        # Feuille de comparaison (pivot)
        pivot_df = results_df.pivot(index='ID_Equipe', columns='Durée_Jours', values='Capacité_Heure')
        pivot_df.to_excel(writer, sheet_name='Comparaison_Capacité')
    
    print(f"\n✅ Fichier Excel créé: {filename}")
    print(f"📊 Feuilles créées:")
    print(f"   • Calculs_Capacité: Tous les calculs détaillés")
    print(f"   • Résumé_Equipes: Vue d'ensemble des équipes")
    print(f"   • Données_Brutes: Données originales")
    print(f"   • Comparaison_Capacité: Tableau croisé des capacités")
    
    return filename

if __name__ == "__main__":
    quick_capacity_calculation()
