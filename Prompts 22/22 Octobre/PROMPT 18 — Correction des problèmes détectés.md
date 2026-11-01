# CORRECTION CONTRÔLÉE
**RÈGLE ABSOLUE — AUDIT AVANT DÉVELOPPEMENT : avant d'écrire ou modifier une seule ligne de code, vérifie systématiquement si la fonctionnalité demandée existe déjà dans l'application, même partiellement, sous un autre nom, dans un autre module ou avec une implémentation différente. Analyse le frontend, le backend, la base de données, les API, les services, les composants, les hooks, les routes et les tests concernés. Si une implémentation existe, réutilise-la et adapte-la au besoin au lieu d'en créer une nouvelle. Si elle existe partiellement, complète uniquement ce qui manque. Si elle n'existe pas, alors seulement, propose puis implémente une nouvelle solution. L'objectif est d'éviter absolument les doublons, les fonctionnalités parallèles, les modèles de données redondants et les régressions. a la fin de chaque implementation faire un rapport de ce qui a ete fait et verifier si cela fonction dans le fichier Prompt _ numero du prompt.md**
À partir du rapport d'audit précédent, corrige uniquement les problèmes réellement identifiés.

## RÈGLES

- Ne réécris pas l'architecture sans nécessité.
- Ne change pas les fonctionnalités validées.
- Ne crée pas de nouvelles fonctionnalités.
- Corrige une catégorie de problème à la fois.
- Conserve la compatibilité avec la base de données existante.
- Ajoute ou adapte les tests nécessaires.

Pour chaque correction :

1. expliquer le problème ;
2. identifier la cause ;
3. modifier uniquement les fichiers nécessaires ;
4. exécuter les tests ;
5. vérifier le build ;
6. vérifier le lint ;
7. vérifier le typecheck.

À la fin :

| Problème | Correction | Test | Résultat |
|---|---|---|---|

Tests obligatoirement exécutés depuis la racine.