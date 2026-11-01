# Guide de Connexion des Boîtes Email Universelles · IT4WORK / MDIV Business

Ce guide détaille le processus officiel et pas-à-pas pour connecter vos adresses email professionnelles et personnelles (**Gmail**, **OVHcloud**, **Outlook / Microsoft 365**, ou tout autre serveur **IMAP/SMTP**) à l'application.

Une fois votre boîte connectée :
- Vous pouvez lire vos emails directement depuis l'application.
- L'assistant IA peut rédiger des réponses automatiques ou manuelles adaptées.
- Vos emails sont envoyés avec **votre propre adresse professionnelle**, sans intermédiaire ni mention "via MDIV".

---

## 1. Connexion Gmail & Google Workspace (Procédure Validée)

> **Important** : Pour des raisons de sécurité renforcée depuis mai 2022, **Google interdit l'usage du mot de passe de compte habituel** pour les connexions IMAP/SMTP. Vous devez impérativement générer un **« Mot de passe d'application » (16 lettres)**.

### Étape 1 : Activer la Validation en deux étapes
1. Rendez-vous dans les paramètres de sécurité de votre compte Google :  
   👉 **[https://myaccount.google.com/security](https://myaccount.google.com/security)**
2. Dans la section **« Connexion à Google »**, vérifiez que la **Validation en deux étapes (2FA)** est bien activée. Si ce n'est pas le cas, activez-la (par SMS ou application d'authentification).

### Étape 2 : Créer le Mot de passe d'application (16 lettres)
1. Ouvrez directement la page dédiée aux mots de passe d'application Google :  
   👉 **[https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)**
2. Dans le champ **« Nom de l'application »**, saisissez un nom repère, par exemple :
   ```text
   IT4WORK - MDIV Business
   ```
3. Cliquez sur le bouton **Créer**.
4. Une fenêtre Google s'affiche avec un code de **16 lettres** dans un encadré jaune (exemple : `abcd efgh ijkl mnop`).
5. **Copiez ce code de 16 lettres**.

> **Astuce** : Vous pouvez copier le code avec ou sans les espaces. L'application nettoie automatiquement les espaces superflus.

### Étape 3 : Vérifier l'activation du protocole IMAP dans Gmail
1. Rendez-vous dans les paramètres de votre boîte Gmail :  
   👉 **[https://mail.google.com/mail/u/0/#settings/fwdandpop](https://mail.google.com/mail/u/0/#settings/fwdandpop)**
2. À la ligne **« Accès IMAP »**, assurez-vous que les options IMAP sont présentes ou que l'option **« Activer IMAP »** est sélectionnée.
3. Si vous avez modifié une valeur, cliquez sur **Enregistrer les modifications** tout en bas de page.

### Étape 4 : Connexion dans l'application
1. Ouvrez l'application et rendez-vous sur le module **Assistant Email** ou cliquez sur **« Connecter une Boîte »**.
2. Cliquez sur le profil rapide **🔴 Gmail / Google Workspace**.
3. Renseignez :
   - **Adresse email complète** : `votre.nom@gmail.com` ou votre adresse Google Workspace professionnelle.
   - **Nom d'affichage** : Votre nom ou celui de votre entreprise (ex: `Eric Papain · MDIV Business`).
   - **Mot de passe de la boîte ou d'application** : Collez le **code de 16 lettres** généré à l'Étape 2.
4. Les réglages serveurs recommandés sont automatiquement pré-remplis :
   - **Serveur entrant IMAP** : `imap.gmail.com` | Port `993` | SSL activé
   - **Serveur sortant SMTP** : `smtp.gmail.com` | Port `465` | SSL activé
5. Cliquez sur **« Tester & Enregistrer la boîte »**.
6. La notification **« La boîte a été connectée avec succès ! »** s'affiche.

---

## 2. Connexion OVHcloud / ITID France (ex: contact@itid-france.com)

Pour les adresses hébergées chez OVHcloud :

1. Cliquez sur le bouton profil **🏥 ITID France / OVHcloud**.
2. Saisissez votre adresse email complète (ex. `contact@itid-france.com`).
3. **Mot de passe** : Saisissez le **mot de passe propre à la boîte mail** (celui utilisé pour vous connecter sur le Webmail OVH `ssl0.ovh.net` ou `mail.ovh.net`), et **non** votre mot de passe d'identifiant client OVH `xx12345-ovh`.
4. Paramètres serveurs configurés automatiquement :
   - **Serveur entrant IMAP** : `ssl0.ovh.net` | Port `993` | SSL activé
   - **Serveur sortant SMTP** : `ssl0.ovh.net` | Port `465` | SSL activé (ou Port `587` sans SSL / STARTTLS)
5. Cliquez sur **Tester & Enregistrer**.

---

## 3. Connexion Microsoft Outlook / Office 365

### Comptes Personnels (@outlook.com, @hotmail.com, @live.fr)
1. Activez la vérification en 2 étapes sur votre compte Microsoft.
2. Générez un mot de passe d'application sur :  
   👉 **[https://account.live.com/proofs/AppPassword](https://account.live.com/proofs/AppPassword)**
3. Dans l'application, sélectionnez **🔵 Outlook**.
4. Utilisez le mot de passe d'application généré.

### Comptes Professionnels Microsoft 365 Entreprise
1. Demandez à votre administrateur Microsoft 365 d'activer l'option **« SMTP Authentifié »** :
   - Dans le Centre d'administration M365 > *Utilisateurs actifs* > Sélectionner l'utilisateur > *Courrier* > *Applications de messagerie* > Cocher **« SMTP authentifié »**.
2. Paramètres serveur Outlook :
   - **Serveur entrant IMAP** : `outlook.office365.com` | Port `993` | SSL activé
   - **Serveur sortant SMTP** : `smtp.office365.com` | Port **`587`** | SSL **décoché** (protocole STARTTLS requis)

---

## 4. Tableau Récapitulatif des Paramètres Serveurs

| Fournisseur | Serveur IMAP (Entrant) | Port IMAP | SSL IMAP | Serveur SMTP (Sortant) | Port SMTP | SSL SMTP | Type de Mot de Passe |
|---|---|---|---|---|---|---|---|
| **Gmail / Google Workspace** | `imap.gmail.com` | 993 | Oui | `smtp.gmail.com` | 465 | Oui | **Mot de passe d'application (16 lettres)** |
| **OVHcloud** | `ssl0.ovh.net` | 993 | Oui | `ssl0.ovh.net` | 465 ou 587 | Oui (465) / Non (587) | Mot de passe du Webmail |
| **Outlook.com / M365** | `outlook.office365.com` | 993 | Oui | `smtp.office365.com` | 587 | Non (STARTTLS) | Mot de passe d'application / M365 |
| **Autre Pro (ex: Gandi, Ionos)** | `mail.votre-domaine.com` | 993 | Oui | `mail.votre-domaine.com` | 465 ou 587 | Oui / Non | Mot de passe de la boîte mail |

---

## 5. Dépannage et Résolution des Erreurs Fréquentes

### Erreur : « Identifiant ou mot de passe refusé » sur Gmail
- **Cause** : Vous avez entré votre mot de passe Gmail habituel au lieu du mot de passe d'application de 16 lettres.
- **Solution** : Générez un mot de passe d'application sur [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).

### Erreur : « Le paramètre mot de passe d'application n'est pas disponible » sur Google
- **Cause** : La validation en 2 étapes (2FA) n'est pas active sur votre compte Google, ou votre administrateur Google Workspace a bloqué les mots de passe d'application.
- **Solution** : Activez d'abord la validation en 2 étapes sur [myaccount.google.com/security](https://myaccount.google.com/security). Pour un compte Workspace entreprise, contactez votre administrateur pour autoriser l'accès.

### Erreur : « Connexion refusée ou délai dépassé » sur le port SMTP
- **Cause** : Incompatibilité de port ou blocage de port par le fournisseur internet.
- **Solution** :
  - Pour Gmail et OVH : privilégier le port **465** avec **SSL coché**.
  - Pour Outlook : utiliser impérativement le port **587** avec **SSL décoché**.

---

*Document maintenu à jour pour la plateforme IT4WORK / MDIV Business.*
