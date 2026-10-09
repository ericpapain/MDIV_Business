# Registre des Comptes et Accès (MDIV Business)

Ce fichier répertorie tous les comptes système et les comptes de démonstration pour tester les différents niveaux d'accès et de forfaits de la plateforme.

## 1. Comptes "Super Administrateur" (Back-office)
*Ces comptes servent à se connecter au panneau d'administration global pour gérer l'IA, les utilisateurs et la plateforme.*
👉 **URL de connexion :** `https://mdiv-network.com/admin/login` (ou `/admin/login` en local)

| Identifiant (Username) | Mot de Passe | Rôle / Explication | Niveau de Liberté |
| :--- | :--- | :--- | :--- |
| `eric` | `eric2026` | Compte Super Admin principal (Créé récemment) | **Absolu** (Accès total au back-office, réglages IA, Qdrant) |
| `micke` | `micke2026` | Compte Super Admin secondaire | **Absolu** |
| `champion` | `Champion2018#` | Compte Admin historique de secours | **Absolu** |

---

## 2. Comptes Entreprises (Front-office / Utilisateurs Finaux)
*Ces comptes servent à se connecter à l'espace de travail (Workspace) en tant que client de MDIV Business, pour tester l'impact des forfaits et des cadenas.*
👉 **URL de connexion :** `https://mdiv-network.com/login` (ou `/login` en local)

| Email (Compte) | Mot de Passe | Explication du compte | Niveau de Liberté / Cadenas |
| :--- | :--- | :--- | :--- |
| `pme@demo.com` | `password` | **Le compte de Démo Ultime.** Il simule une grosse PME qui paie l'abonnement maximal. | 👑 **100% Débloqué.** Tous les cadenas sont ouverts (Fintech, Gouvernance IA, Rapprochement, etc.) |
| `tpe@demo.com` | `password` | Compte intermédiaire simulant une TPE. | 🔓 **Pro.** Bloqué sur la Fintech très avancée, mais accès aux bons modèles d'IA et aux liens de paiement. |
| `independent@demo.com` | `password` | Compte de base payant simulant un Indépendant. | 🔒 **Starter.** Fonctions vitales débloquées (Exports PDF, Voix), mais beaucoup de fonctions avancées bloquées. |
| `creator@demo.com` | `password` | Le compte Gratuit de base pour essayer la plateforme. | ⛔ **Verrouillé.** La majorité des boutons avancés affichent un cadenas. Accès très limité pour frustrer positivement l'utilisateur. |

---

> 💡 **Conseil pour ta présentation de demain :** 
> Si tu veux faire une démo fluide sans jamais être bloqué par un écran "Passez au forfait supérieur", connecte-toi avec `pme@demo.com` (MDP: `password`).
