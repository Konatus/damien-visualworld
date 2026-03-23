#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour calculer la capacité par équipe et stocker les résultats dans Excel
Prend en compte les jours ouvrés (5 jours sur 7)
"""

import pandas as pd
import numpy as np
from datetime import datetime
import json

class ExcelCapacityCalculator:
    def __init__(self):
        """Initialise le calculateur Excel"""
        self.working_days_ratio = 5/7  # 5 jours ouvrés sur 7
        self.hours_per_working_day = 8  # 8 heures par jour ouvré
        
    def load_team_data(self):
        """
        Charge les données de la table team_ressources
        """
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
        
        return pd.DataFrame(data)
    
    def calculate_capacity_with_working_days(self, df, iteration_duration_days):
        """
        Calcule la capacité en tenant compte des jours ouvrés
        
        Args:
            df: DataFrame avec les données des équipes
            iteration_duration_days: Durée d'itération en jours calendaires
        """
        # Calculer les jours ouvrés
        working_days = iteration_duration_days * self.working_days_ratio
        working_hours = working_days * self.hours_per_working_day
        
        # Grouper par équipe
        team_stats = df.groupby('idteam').agg({
            'capacityBySkillset': ['sum', 'count'],
            'idressource': lambda x: list(x)
        }).reset_index()
        
        # Aplatir les colonnes
        team_stats.columns = ['idteam', 'total_capacity', 'resource_count', 'resources']
        
        results = []
        
        for _, row in team_stats.iterrows():
            team_id = int(row['idteam'])
            total_capacity = int(row['total_capacity'])
            resource_count = int(row['resource_count'])
            resources = row['resources']
            
            # Calcul selon la formule avec jours ouvrés
            iteration_duration_ouvert = 1.0  # Durée d'ouverture d'itération
            max_load = iteration_duration_ouvert * total_capacity
            
            # Capacité calculée avec jours ouvrés
            calculated_capacity_per_hour = max_load / working_hours
            calculated_capacity_per_day = calculated_capacity_per_hour * self.hours_per_working_day
            
            # Capacité totale sur la période
            total_capacity_period = calculated_capacity_per_hour * working_hours
            
            # Pourcentages
            capacity_percentage_hour = (calculated_capacity_per_hour / total_capacity) * 100
            capacity_percentage_day = (calculated_capacity_per_day / total_capacity) * 100
            
            result = {
                'idteam': team_id,
                'resources': resources,
                'resource_count': resource_count,
                'total_capacity': total_capacity,
                'iteration_duration_days': iteration_duration_days,
                'working_days': working_days,
                'working_hours': working_hours,
                'max_load': max_load,
                'calculated_capacity_per_hour': calculated_capacity_per_hour,
                'calculated_capacity_per_day': calculated_capacity_per_day,
                'total_capacity_period': total_capacity_period,
                'capacity_percentage_hour': capacity_percentage_hour,
                'capacity_percentage_day': capacity_percentage_day
            }
            
            results.append(result)
            
        return results
    
    def create_excel_report(self, results_list, filename="team_capacity_report.xlsx"):
        """
        Crée un rapport Excel avec plusieurs feuilles
        
        Args:
            results_list: Liste des résultats pour différentes durées
            filename: Nom du fichier Excel
        """
        with pd.ExcelWriter(filename, engine='openpyxl') as writer:
            
            # Feuille 1: Résumé général
            summary_data = []
            for results in results_list:
                duration = results[0]['iteration_duration_days']
                for result in results:
                    summary_data.append({
                        'Durée_Itération_Jours': duration,
                        'ID_Equipe': result['idteam'],
                        'Nb_Ressources': result['resource_count'],
                        'Capacité_Totale': result['total_capacity'],
                        'Jours_Ouvrés': result['working_days'],
                        'Heures_Ouvrées': result['working_hours'],
                        'Capacité_Heure': round(result['calculated_capacity_per_hour'], 4),
                        'Capacité_Jour': round(result['calculated_capacity_per_day'], 2),
                        'Capacité_Période': round(result['total_capacity_period'], 2),
                        'Pourcentage_Heure': round(result['capacity_percentage_hour'], 4),
                        'Pourcentage_Jour': round(result['capacity_percentage_day'], 2)
                    })
            
            summary_df = pd.DataFrame(summary_data)
            summary_df.to_excel(writer, sheet_name='Résumé_Général', index=False)
            
            # Feuilles individuelles pour chaque durée
            for results in results_list:
                duration = results[0]['iteration_duration_days']
                sheet_name = f'Durée_{duration}_jours'
                
                # Préparer les données pour cette durée
                duration_data = []
                for result in results:
                    duration_data.append({
                        'ID_Equipe': result['idteam'],
                        'Ressources': ', '.join(map(str, result['resources'])),
                        'Nb_Ressources': result['resource_count'],
                        'Capacité_Totale': result['total_capacity'],
                        'Jours_Ouvrés': result['working_days'],
                        'Heures_Ouvrées': result['working_hours'],
                        'Max_Load': result['max_load'],
                        'Capacité_Heure': round(result['calculated_capacity_per_hour'], 4),
                        'Capacité_Jour': round(result['calculated_capacity_per_day'], 2),
                        'Capacité_Période': round(result['total_capacity_period'], 2),
                        'Pourcentage_Heure': round(result['capacity_percentage_hour'], 4),
                        'Pourcentage_Jour': round(result['capacity_percentage_day'], 2)
                    })
                
                duration_df = pd.DataFrame(duration_data)
                duration_df.to_excel(writer, sheet_name=sheet_name, index=False)
            
            # Feuille: Comparaison des durées
            comparison_data = []
            durations = [results[0]['iteration_duration_days'] for results in results_list]
            
            for duration in durations:
                results = next(r for r in results_list if r[0]['iteration_duration_days'] == duration)
                for result in results:
                    comparison_data.append({
                        'Durée_Jours': duration,
                        'ID_Equipe': result['idteam'],
                        'Capacité_Heure': round(result['calculated_capacity_per_hour'], 4),
                        'Capacité_Jour': round(result['calculated_capacity_per_day'], 2),
                        'Pourcentage_Heure': round(result['capacity_percentage_hour'], 4)
                    })
            
            comparison_df = pd.DataFrame(comparison_data)
            comparison_df.to_excel(writer, sheet_name='Comparaison_Durées', index=False)
            
            # Feuille: Données brutes
            raw_data = self.load_team_data()
            raw_data.to_excel(writer, sheet_name='Données_Brutes', index=False)
        
        print(f"✅ Rapport Excel créé: {filename}")
        return filename

def main():
    """
    Fonction principale
    """
    print("=== CALCULATEUR DE CAPACITÉ AVEC JOURS OUVRÉS ===")
    print("📅 Prise en compte: 5 jours ouvrés sur 7 (8h/jour)")
    print()
    
    # Initialiser le calculateur
    calculator = ExcelCapacityCalculator()
    
    # Charger les données
    df = calculator.load_team_data()
    print(f"📊 Données chargées: {len(df)} ressources réparties sur {df['idteam'].nunique()} équipes")
    print()
    
    # Différentes durées d'itération à tester
    durations = [1, 7, 15, 30, 60]  # jours
    
    results_list = []
    
    for duration in durations:
        print(f"🔄 Calcul pour {duration} jour(s)...")
        results = calculator.calculate_capacity_with_working_days(df, duration)
        results_list.append(results)
        
        # Afficher un aperçu
        print(f"   📈 Équipe 1: {results[0]['calculated_capacity_per_hour']:.4f} unités/heure")
        print(f"   📈 Équipe 1: {results[0]['calculated_capacity_per_day']:.2f} unités/jour")
        print()
    
    # Créer le rapport Excel
    filename = calculator.create_excel_report(results_list)
    
    print("=== RÉSUMÉ DES RÉSULTATS ===")
    print(f"📁 Fichier Excel créé: {filename}")
    print(f"📊 Nombre de feuilles: 5+ (Résumé, Comparaison, Données brutes + feuilles par durée)")
    print()
    
    # Afficher quelques exemples
    print("📋 Exemples de calculs (Équipe 1):")
    for i, duration in enumerate(durations):
        result = results_list[i][0]  # Équipe 1
        print(f"   • {duration} jour(s): {result['calculated_capacity_per_hour']:.4f} unités/heure")
    
    return filename

if __name__ == "__main__":
    main()
