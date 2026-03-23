#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script spécialisé pour l'intégration avec la base de données Visual World
Calcule la capacité par équipe et génère les données pour l'échange avec la DB
"""

import json
import sqlite3
from typing import List, Dict, Any
import pandas as pd

class VisualWorldCapacityCalculator:
    def __init__(self, db_path: str = None, iteration_duration: float = 1.0):
        """
        Initialise le calculateur pour Visual World
        
        Args:
            db_path: Chemin vers la base de données SQLite (optionnel)
            iteration_duration: Durée d'itération en heures
        """
        self.db_path = db_path
        self.iteration_duration = iteration_duration
        
    def calculate_team_capacity_from_data(self, data: List[Dict]) -> List[Dict]:
        """
        Calcule la capacité par équipe à partir des données fournies
        
        Args:
            data: Liste des données de la base de données
            
        Returns:
            Liste des capacités calculées par équipe
        """
        # Convertir en DataFrame pour faciliter les calculs
        df = pd.DataFrame(data)
        
        # Grouper par équipe et calculer les métriques
        team_stats = df.groupby('idteam').agg({
            'capacityBySkillset': ['sum', 'count'],
            'idressource': 'count'
        }).reset_index()
        
        # Aplatir les colonnes
        team_stats.columns = ['idteam', 'total_capacity', 'resource_count', 'resource_count_2']
        
        results = []
        
        for _, row in team_stats.iterrows():
            team_id = int(row['idteam'])
            total_capacity = row['total_capacity']
            resource_count = row['resource_count']
            
            # Calcul selon la formule: capacité = maxLoad / iteration_duration
            # maxLoad = iteration_duration_ouvert * Somme(capacité équipe)
            iteration_duration_ouvert = 1.0  # Peut être ajusté selon vos besoins
            max_load = iteration_duration_ouvert * total_capacity
            calculated_capacity = max_load / self.iteration_duration
            
            # Calculer le pourcentage de capacité
            capacity_percentage = (calculated_capacity / total_capacity) * 100
            
            result = {
                'idteam': int(team_id),
                'total_capacity': int(total_capacity),
                'resource_count': int(resource_count),
                'max_load': float(max_load),
                'calculated_capacity': float(calculated_capacity),
                'capacity_percentage': round(float(capacity_percentage), 2),
                'iteration_duration': float(self.iteration_duration)
            }
            
            results.append(result)
            
        return results
    
    def generate_database_update_queries(self, results: List[Dict]) -> List[str]:
        """
        Génère les requêtes SQL pour mettre à jour la base de données
        
        Args:
            results: Résultats des calculs de capacité
            
        Returns:
            Liste des requêtes SQL
        """
        queries = []
        
        for result in results:
            # Requête pour mettre à jour la capacité calculée
            query = f"""
            UPDATE team_capacity 
            SET calculated_capacity = {result['calculated_capacity']},
                capacity_percentage = {result['capacity_percentage']},
                max_load = {result['max_load']},
                last_updated = CURRENT_TIMESTAMP
            WHERE idteam = {result['idteam']};
            """
            queries.append(query.strip())
            
        return queries
    
    def export_for_visual_world(self, results: List[Dict]) -> Dict[str, Any]:
        """
        Exporte les données dans le format attendu par Visual World
        
        Args:
            results: Résultats des calculs
            
        Returns:
            Dictionnaire formaté pour Visual World
        """
        export_data = {
            'timestamp': pd.Timestamp.now().isoformat(),
            'iteration_duration': self.iteration_duration,
            'teams': []
        }
        
        for result in results:
            team_data = {
                'team_id': result['idteam'],
                'capacity': {
                    'total': result['total_capacity'],
                    'calculated': result['calculated_capacity'],
                    'percentage': result['capacity_percentage'],
                    'max_load': result['max_load']
                },
                'resources': {
                    'count': result['resource_count']
                }
            }
            export_data['teams'].append(team_data)
            
        return export_data

def main():
    """
    Fonction principale pour tester avec vos données
    """
    # Vos données de base de données
    database_data = [
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
    
    # Initialiser le calculateur
    calculator = VisualWorldCapacityCalculator(iteration_duration=1.0)
    
    # Calculer les capacités
    results = calculator.calculate_team_capacity_from_data(database_data)
    
    # Afficher les résultats détaillés
    print("=== CALCUL DE CAPACITÉ POUR VISUAL WORLD ===")
    print(f"Durée d'itération: {calculator.iteration_duration} heure(s)")
    print()
    
    for result in results:
        print(f"Équipe {result['idteam']}:")
        print(f"  📊 Capacité totale: {result['total_capacity']}")
        print(f"  👥 Ressources: {result['resource_count']}")
        print(f"  ⚡ Max Load: {result['max_load']}")
        print(f"  🎯 Capacité calculée: {result['calculated_capacity']}")
        print(f"  📈 Pourcentage: {result['capacity_percentage']}%")
        print()
    
    # Exporter pour Visual World
    visual_world_export = calculator.export_for_visual_world(results)
    
    print("=== EXPORT POUR VISUAL WORLD ===")
    print(json.dumps(visual_world_export, indent=2, ensure_ascii=False))
    
    # Générer les requêtes SQL
    sql_queries = calculator.generate_database_update_queries(results)
    
    print("\n=== REQUÊTES SQL POUR MISE À JOUR DE LA BASE ===")
    for i, query in enumerate(sql_queries, 1):
        print(f"-- Requête {i}:")
        print(query)
        print()
    
    return results

if __name__ == "__main__":
    main()
