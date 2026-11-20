"""
Script de déploiement direct par FTP vers OVH (sans passer par GitHub Actions)
Usage:
    python scripts/deploy_ovh.py
"""
import os
import sys
from ftplib import FTP, error_perm

# Configuration par défaut
FTP_HOST = os.getenv('FTP_SERVER', 'ftp.mdiv-network.com')
FTP_USER = os.getenv('FTP_USERNAME', 'zwpvaah')
FTP_PASS = os.getenv('FTP_PASSWORD', '')

DIST_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dist')
REMOTE_DIR = 'www'

def upload_directory(ftp, local_path, remote_path):
    print(f"📁 Synchronisation: {local_path} -> {remote_path}")
    try:
        ftp.cwd(remote_path)
    except error_perm:
        ftp.mkd(remote_path)
        ftp.cwd(remote_path)

    for item in os.listdir(local_path):
        local_item = os.path.join(local_path, item)
        if os.path.isdir(local_item):
            upload_directory(ftp, local_item, item)
            ftp.cwd("..")
        else:
            with open(local_item, 'rb') as f:
                print(f"  ⬆️ Envoi: {item}")
                ftp.storbinary(f"STOR {item}", f)

def main():
    global FTP_HOST, FTP_USER, FTP_PASS
    print("🚀 DÉPLOIEMENT DIRECT VERS OVH (MDIV-NETWORK)")
    print("---------------------------------------------")

    if not os.path.exists(DIST_DIR):
        print(f"❌ Dossier dist/ introuvable à l'adresse: {DIST_DIR}")
        print("Veuillez d'abord exécuter: npm run build")
        sys.exit(1)

    host = input(f"Hôte FTP [{FTP_HOST}]: ").strip() or FTP_HOST
    user = input(f"Identifiant FTP [{FTP_USER}]: ").strip() or FTP_USER
    password = FTP_PASS
    if not password:
        import getpass
        password = getpass.getpass("Mot de passe FTP OVH: ")

    print(f"\nConnexion à {host} en tant que {user}...")
    try:
        ftp = FTP(host, timeout=30)
        ftp.login(user, password)
        print("✅ Connexion FTP réussie !")
        
        # Aller à la racine puis dans www
        ftp.cwd('/')
        upload_directory(ftp, DIST_DIR, REMOTE_DIR)
        ftp.quit()
        print("\n🎉 Déploiement terminé avec succès sur https://www.mdiv-network.com !")
    except Exception as e:
        print(f"\n❌ Erreur lors du déploiement FTP: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()

