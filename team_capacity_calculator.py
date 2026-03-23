#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script pour calculer la capacité par équipe selon la formule:
capacité = maxLoad / iteration_duration

Où maxLoad = iteration_duration_ouvert * Somme(capacité équipe)
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
import json

class TeamCapacityCalculator:
    def __init__(self, iteration_duration: float = 1.0):
        """
        Initialise le calculateur de capacité d'équipe
        
        Args:
            iteration_duration: Durée d'itération en heures (par défaut 1.0)
        """
        self.iteration_duration = iteration_duration
        
    def load_database_data(self, data: List[Dict]) -> pd.DataFrame:
        """
        Charge les données de la base de données dans un DataFrame
        
        Args:
            data: Liste de dictionnaires contenant les données de la DB
            
        Returns:
            DataFrame pandas avec les données structurées
        """
        df = pd.DataFrame(data)
        return df
    
    def calculate_team_capacity(self, df: pd.DataFrame) -> Dict[int, Dict]:
        """
        Calcule la capacité par équipe selon la formule demandée
        
        Args:
            df: DataFrame contenant les données de la base
            
        Returns:
            Dictionnaire avec les capacités calculées par équipe
        """
        # Grouper par équipe et calculer la somme des capacités
        team_capacities = df.groupby('idteam').agg({
            'capacityBySkillset': 'sum',
            'idressource': 'count'  # Nombre de ressources par équipe
        }).reset_index()
        
        team_capacities.columns = ['idteam', 'total_capacity', 'resource_count']
        
        # Calculer maxLoad et capacité selon la formule
        results = {}
        
        for _, row in team_capacities.iterrows():
            team_id = int(row['idteam'])
            total_capacity = row['total_capacity']
            resource_count = row['resource_count']
            
            # maxLoad = iteration_duration_ouvert * Somme(capacité équipe)
            # Pour cet exemple, on suppose iteration_duration_ouvert = 1.0
            iteration_duration_ouvert = 1.0
            max_load = iteration_duration_ouvert * total_capacity
            
            # capacité = maxLoad / iteration_duration
            calculated_capacity = max_load / self.iteration_duration
            
            # Calculer le pourcentage (exemple: équipe avec 300% de capacité)
            capacity_percentage = (calculated_capacity / total_capacity) * 100
            
            results[team_id] = {
                'team_id': team_id,
                'total_capacity': total_capacity,
                'resource_count': resource_count,
                'max_load': max_load,
                'calculated_capacity': calculated_capacity,
                'capacity_percentage': capacity_percentage,
                'iteration_duration': self.iteration_duration
            }
            
        return results
    
    def export_results(self, results: Dict[int, Dict], output_format: str = 'json') -> str:
        """
        Exporte les résultats dans le format demandé
        
        Args:
            results: Dictionnaire des résultats calculés
            output_format: Format d'export ('json', 'csv', 'array')
            
        Returns:
            Chaîne contenant les résultats exportés
        """
        if output_format == 'json':
            return json.dumps(results, indent=2, ensure_ascii=False)
        
        elif output_format == 'csv':
            df_results = pd.DataFrame.from_dict(results, orient='index')
            return df_results.to_csv(index=False)
        
        elif output_format == 'array':
            # Format array pour l'échange avec la base de données
            array_data = []
            for team_id, data in results.items():
                array_data.append({
                    'idteam': team_id,
                    'capacity': data['calculated_capacity'],
                    'percentage': data['capacity_percentage']
                })
            return json.dumps(array_data, indent=2)
        
        else:
            raise ValueError(f"Format d'export non supporté: {output_format}")

def main():
    """
    Fonction principale pour tester le calculateur
    """
    # Données de votre base de données (exemple)
    sample_data = [
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
    calculator = TeamCapacityCalculator(iteration_duration=1.0)
    
    # Charger les données
    df = calculator.load_database_data(sample_data)
    
    # Calculer les capacités par équipe
    results = calculator.calculate_team_capacity(df)
    
    # Afficher les résultats
    print("=== RÉSULTATS DU CALCUL DE CAPACITÉ PAR ÉQUIPE ===")
    for team_id, data in results.items():
        print(f"\nÉquipe {team_id}:")
        print(f"  - Capacité totale: {data['total_capacity']}")
        print(f"  - Nombre de ressources: {data['resource_count']}")
        print(f"  - Max Load: {data['max_load']}")
        print(f"  - Capacité calculée: {data['calculated_capacity']}")
        print(f"  - Pourcentage de capacité: {data['capacity_percentage']:.1f}%")
    
    # Exporter en format array pour l'échange avec la DB
    print("\n=== EXPORT POUR BASE DE DONNÉES (FORMAT ARRAY) ===")
    array_export = calculator.export_results(results, 'array')
    print(array_export)
    
    return results

if __name__ == "__main__":
    main()
