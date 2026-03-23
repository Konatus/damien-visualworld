#!/usr/bin/env python3
"""
Script Python pour calculer start_date dans InputDataOptimization.xlsx
Formule: start_date = CALC_due_date - duration
"""

import pandas as pd
from datetime import datetime, timedelta
import os

def calculate_start_date():
    """Calculer start_date dans le fichier Excel"""
    
    file_path = "DataFile/InputDataOptimization.xlsx"
    
    print("🧮 Calcul start_date dans InputDataOptimization.xlsx")
    print(f"📂 Fichier: {file_path}")
    
    # Vérifier que le fichier existe
    if not os.path.exists(file_path):
        print("❌ Fichier InputDataOptimization.xlsx non trouvé")
        return
    
    try:
        # Lire le fichier Excel
        print("📖 Lecture du fichier Excel...")
        df = pd.read_excel(file_path, sheet_name="Objets")
        print(f"📊 {len(df)} lignes trouvées dans la feuille Objets")
        
        # Afficher les colonnes disponibles
        print("📋 Colonnes disponibles:")
        for i, col in enumerate(df.columns):
            print(f"  {i+1}. {col}")
        
        # Calculer start_date pour chaque ligne
        calculated_count = 0
        
        for index, row in df.iterrows():
            # Récupérer CALC_due_date et duration
            due_date = row.get('CALC_due_date')
            duration = row.get('CALC_duration')
            
            print(f"🔍 Ligne {index + 1}: CALC_due_date={due_date}, duration={duration}")
            
            if pd.notna(due_date) and pd.notna(duration) and duration != 'null':
                try:
                    # Convertir en date et durée (gérer format français)
                    if isinstance(due_date, str):
                        # Essayer format français d/m/Y puis format ISO
                        try:
                            due_date_obj = datetime.strptime(due_date, '%d/%m/%Y')
                        except ValueError:
                            try:
                                due_date_obj = datetime.strptime(due_date, '%Y-%m-%d')
                            except ValueError:
                                due_date_obj = pd.to_datetime(due_date)
                    else:
                        due_date_obj = pd.to_datetime(due_date)
                    
                    duration_days = float(duration)
                    
                    if duration_days > 0:
                        # Calculer start_date = due_date - duration
                        start_date_obj = due_date_obj - timedelta(days=duration_days)
                        start_date_str = start_date_obj.strftime('%Y-%m-%d')
                        
                        # Mettre à jour la colonne start_date
                        df.at[index, 'start_date'] = start_date_str
                        calculated_count += 1
                        
                        print(f"✅ Ligne {index + 1}: {due_date} - {duration} = {start_date_str}")
                    
                except Exception as e:
                    print(f"⚠️ Erreur ligne {index + 1}: {e}")
            else:
                # Mettre start_date à null si pas de données
                df.at[index, 'start_date'] = None
                print(f"⚠️ Ligne {index + 1}: Pas de CALC_due_date ou duration")
        
        print(f"✅ {calculated_count} start_date calculées sur {len(df)} lignes")
        
        # Sauvegarder le fichier modifié
        print("💾 Sauvegarde du fichier modifié...")
        
        # Lire toutes les feuilles pour les préserver
        with pd.ExcelFile(file_path) as xls:
            sheets = {}
            for sheet_name in xls.sheet_names:
                if sheet_name == "Objets":
                    sheets[sheet_name] = df  # Feuille modifiée
                else:
                    sheets[sheet_name] = pd.read_excel(xls, sheet_name=sheet_name)
                print(f"📋 Feuille '{sheet_name}' préservée")
        
        # Écrire toutes les feuilles
        with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
            for sheet_name, sheet_df in sheets.items():
                sheet_df.to_excel(writer, sheet_name=sheet_name, index=False)
                print(f"✅ Feuille '{sheet_name}' sauvegardée")
        
        print("🎉 Fichier InputDataOptimization.xlsx mis à jour avec les start_date !")
        print(f"📊 Résumé: {calculated_count} start_date calculées")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    calculate_start_date()
