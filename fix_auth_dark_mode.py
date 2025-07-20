#!/usr/bin/env python3
"""
Script pour corriger le mode sombre dans les pages d'authentification
"""

import os
import re

# Pages d'authentification à corriger
auth_pages = [
    'frontend/src/pages/auth/LoginStudent.tsx',
    'frontend/src/pages/auth/LoginInstructor.tsx',
    'frontend/src/pages/auth/RegisterPage.tsx'
]

def fix_auth_page(file_path):
    """Corrige une page d'authentification pour le mode sombre"""
    if not os.path.exists(file_path):
        print(f"❌ Fichier non trouvé: {file_path}")
        return
    
    print(f"🔧 Correction de {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Corrections communes
    corrections = [
        # Titres
        (r'text-gray-900(\s+[^"]*?")', r'text-gray-900 dark:text-white\1'),
        # Textes secondaires
        (r'text-gray-600(\s+[^"]*?")', r'text-gray-600 dark:text-gray-400\1'),
        (r'text-gray-700(\s+[^"]*?")', r'text-gray-700 dark:text-gray-300\1'),
        # Labels de formulaire
        (r'text-gray-700(\s+mb-2")', r'text-gray-700 dark:text-gray-300\1'),
        # Icônes
        (r'text-gray-400(\s+[^"]*?")', r'text-gray-400 dark:text-gray-500\1'),
        # Inputs
        (r'border-gray-300(\s+[^"]*?rounded-lg)', r'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white\1'),
        # Boutons hover
        (r'hover:text-gray-600(\s+[^"]*?")', r'hover:text-gray-600 dark:hover:text-gray-300\1'),
        (r'hover:text-gray-700(\s+[^"]*?")', r'hover:text-gray-700 dark:hover:text-gray-300\1'),
        # Liens
        (r'text-blue-600 hover:text-blue-500(\s+[^"]*?")', r'text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300\1'),
        (r'text-gray-500 hover:text-gray-700(\s+[^"]*?")', r'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300\1'),
        # Séparateurs
        (r'text-gray-300(\s+[^"]*?">)', r'text-gray-300 dark:text-gray-600\1'),
        # Focus ring offset
        (r'focus:ring-offset-2(\s+[^"]*?")', r'focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900\1'),
    ]
    
    # Appliquer les corrections
    for pattern, replacement in corrections:
        content = re.sub(pattern, replacement, content)
    
    # Ajouter l'import ThemeToggle si pas présent
    if 'ThemeToggle' not in content:
        import_line = "import { ThemeToggle } from '../../components/common/ThemeToggle';"
        # Trouver la dernière ligne d'import
        lines = content.split('\n')
        last_import_index = -1
        for i, line in enumerate(lines):
            if line.strip().startswith('import '):
                last_import_index = i
        
        if last_import_index >= 0:
            lines.insert(last_import_index + 1, import_line)
            content = '\n'.join(lines)
    
    # Ajouter le ThemeToggle dans le JSX si pas présent
    if 'ThemeToggle' not in content or '<ThemeToggle' not in content:
        # Chercher le div principal avec min-h-screen
        theme_toggle_jsx = '''      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

'''
        
        # Insérer après le div principal
        content = re.sub(
            r'(<div className="min-h-screen[^>]*>)\s*(<motion\.div)',
            r'\1\n' + theme_toggle_jsx + r'      \2',
            content
        )
    
    # Corriger le background du conteneur principal
    content = re.sub(
        r'min-h-screen bg-gradient-to-br from-[^"]*?"',
        lambda m: m.group(0).replace('"', ' dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200"'),
        content
    )
    
    # Sauvegarder
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ {file_path} corrigé")

def main():
    print("🌙 Correction du mode sombre pour les pages d'authentification")
    print("=" * 60)
    
    for page in auth_pages:
        fix_auth_page(page)
    
    print("\n🎉 Toutes les pages d'authentification ont été corrigées !")
    print("\nCorrections appliquées:")
    print("- Ajout du support du mode sombre pour tous les textes")
    print("- Correction des couleurs des formulaires")
    print("- Ajout du ThemeToggle")
    print("- Correction des backgrounds et bordures")

if __name__ == "__main__":
    main()
