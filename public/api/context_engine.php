<?php
// public/api/context_engine.php
/**
 * Moteur de Contexte d'Entreprise & Injection de Persona Métier Dynamique (Brique 3)
 * 
 * RÔLE :
 * 1. Charger le profil complet de l'entreprise (nom, activité, code NAF, forme juridique, ville).
 * 2. Charger les interactions historiques et précédents livrables (mémoire court/moyen terme).
 * 3. Détecter le domaine d'activité et injecter le comportement d'expert spécifique :
 *    - Électricien / BTP -> Expert normes NFC 15-100, DTU, sécurité décennale.
 *    - Clinique / Santé / Vétérinaire -> Expert déontologie, traçabilité des soins, secret professionnel.
 *    - Droit / Conseil / Audit -> Expert juridique, conformité RGPD, rigueur contractuelle.
 *    - Tech / SaaS / Digital -> Expert architectures Cloud, sécurité ISO 27001, SLA.
 *    - Commerce / Industrie -> Expert marges, gestion des stocks, conformité DGCCRF.
 */

require_once __DIR__ . '/config.php';

function get_company_context($company_id = null, $query_text = '') {
    $context = [
        'company' => null,
        'recent_works' => [],
        'vector_knowledge' => [],
        'domain_expertise' => 'Généraliste Direction d\'Entreprise',
        'domain_rules' => '',
        'prompt_injection' => ''
    ];

    if (!$company_id || intval($company_id) <= 0) {
        return $context;
    }

    try {
        $pdo = get_db_connection();

        // 1. Profil de l'entreprise
        $stmt = $pdo->prepare("SELECT id, siren, siret, company_name, trade_name, legal_form, naf_code, activity, city, employee_range FROM companies WHERE id = ? LIMIT 1");
        $stmt->execute([intval($company_id)]);
        $company = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($company) {
            $context['company'] = $company;

            // 2. Détection du domaine métier & règles d'expertise spécifiques
            $activity_text = strtolower(($company['activity'] ?? '') . ' ' . ($company['naf_code'] ?? '') . ' ' . ($company['company_name'] ?? ''));
            
            if (preg_match('/(electri|cablage|domotique|courant|43\.21a)/i', $activity_text)) {
                $context['domain_expertise'] = "Expert Technique Électricité & Normes Électriques";
                $context['domain_rules'] = "RÈGLES SECTORIELLES ÉLECTRICITÉ :
- Réfère-toi aux normes françaises en vigueur (notamment la norme NF C 15-100, NF C 18-510 pour les habilitations, et les directives Consuel).
- Vérifie toujours la sécurité des personnes (disjoncteurs différentiels 30mA, section des conducteurs, mise à la terre).
- Mentionne systématiquement les obligations de garantie décennale et les certifications RGE / Qualifelec si pertinent.";
            } elseif (preg_match('/(veterinaire|clinique|medical|sante|soin|dent|pharma|75\.00z|86\.)/i', $activity_text)) {
                $context['domain_expertise'] = "Expert Santé & Déontologie Médicale / Vétérinaire";
                $context['domain_rules'] = "RÈGLES SECTORIELLES SANTÉ & SOINS :
- Respecte scrupuleusement la déontologie ordinale, le secret médical et la traçabilité des soins.
- Vérifie la conformité des protocoles sanitaires, du stockage des produits soumis à ordonnancier et de la gestion des DASRI.
- Privilégie un ton à la fois rigoureux, empathique et axé sur le bien-être et la sécurité des patients / animaux.";
            } elseif (preg_match('/(batiment|btp|maconnerie|plomberie|peinture|menuiserie|travaux|41\.|43\.)/i', $activity_text)) {
                $context['domain_expertise'] = "Expert BTP, Gros-Œuvre & Génie Civil";
                $context['domain_rules'] = "RÈGLES SECTORIELLES BTP :
- Applique les Documents Techniques Unifiés (DTU) et les règles de l'art applicables.
- Intègre les exigences de sécurité chantier (PPSPS, EPI), d'assurances décennales et de gestion des réserves lors des réceptions de travaux.
- Sois très rigoureux sur le calendrier d'exécution et les pénalités de retard.";
            } elseif (preg_match('/(avocat|juridique|conseil|audit|comptable|expertise|notaire|69\.|70\.)/i', $activity_text)) {
                $context['domain_expertise'] = "Expert Légal, Conformité Réglementaire & Droit des Affaires";
                $context['domain_rules'] = "RÈGLES SECTORIELLES JURIDIQUE & CONSEIL :
- Garantis la conformité stricte au Code de commerce, au RGPD et aux réglementations sectorielles.
- Traque toute clause abusive, ambiguïté rédactionnelle, déséquilibre contractuel ou risque de litige.
- Adopte une précision terminologique absolue.";
            } elseif (preg_match('/(software|saas|informatique|tech|developpement|cloud|ia|cyber|62\.)/i', $activity_text)) {
                $context['domain_expertise'] = "Architecte Systèmes d'Information, SaaS & Cybersécurité";
                $context['domain_rules'] = "RÈGLES SECTORIELLES TECH & CLOUD :
- Respecte les standards d'architecture Cloud, les normes de cybersécurité (ISO 27001, NIS 2) et les exigences de SLA (Service Level Agreement).
- Porte une attention rigoureuse à la propriété intellectuelle des codes sources et aux licences logicielles.
- Analyse la résilience et la scalabilité technique des solutions.";
            } else {
                $context['domain_expertise'] = "Directeur Général & Stratège d'Entreprise";
                $context['domain_rules'] = "RÈGLES DE GOUVERNANCE GÉNÉRALE :
- Optimise la rentabilité, préserve la trésorerie et maximise le retour sur investissement (ROI).
- Évalue systématiquement la faisabilité opérationnelle et la conformité administrative.";
            }

            // 3. Récupération des livrables récents (historique opérationnel)
            try {
                $stmtWork = $pdo->prepare("SELECT tool_type, title, summary, created_at FROM saved_work WHERE company_id = ? ORDER BY id DESC LIMIT 4");
                $stmtWork->execute([intval($company_id)]);
                $context['recent_works'] = $stmtWork->fetchAll(PDO::FETCH_ASSOC);
            } catch (Exception $e) {
                // table non encore migrée ou vide
            }

            // 4. Recherche sémantique dans la mémoire vectorielle (RAG Hermétique)
            if (!empty(trim($query_text))) {
                try {
                    require_once __DIR__ . '/vector_store.php';
                    $context['vector_knowledge'] = search_company_semantic_memory(intval($company_id), $query_text, 3, 0.65);
                } catch (Exception $e) {
                    // vector search non-bloquant
                }
            }

            // 5. Construction de la directive d'injection
            $promptInjection = "\n\n==================================================\n";
            $promptInjection .= "CONTEXTE DU COMPTE ENTREPRISE ACTIVE :\n";
            $promptInjection .= "- Raison Sociale : " . ($company['company_name'] ?? 'Entreprise Partenaire') . "\n";
            if (!empty($company['siren'])) $promptInjection .= "- SIREN : " . $company['siren'] . "\n";
            if (!empty($company['legal_form'])) $promptInjection .= "- Forme juridique : " . $company['legal_form'] . "\n";
            if (!empty($company['activity'])) $promptInjection .= "- Activité déclarée : " . $company['activity'] . "\n";
            if (!empty($company['city'])) $promptInjection .= "- Siège / Implantation : " . $company['city'] . "\n";
            $promptInjection .= "- POSTURE EXPERTE ASSIGNÉE : " . $context['domain_expertise'] . "\n";
            $promptInjection .= "\n" . $context['domain_rules'] . "\n";

            if (!empty($context['vector_knowledge'])) {
                $promptInjection .= "\nEXTRAITS FACTUELS DE LA BASE DE CONNAISSANCES VECTORIELLE (RAG) :\n";
                foreach ($context['vector_knowledge'] as $vk) {
                    $docName = $vk['document_name'] ?? 'Document interne';
                    $simScore = round(($vk['similarity_score'] ?? 0) * 100);
                    $promptInjection .= "  * [SOURCE : {$docName} (Pertinence: {$simScore}%)] :\n    \"" . trim($vk['chunk_text']) . "\"\n";
                }
            } elseif (!empty($context['recent_works'])) {
                $promptInjection .= "\nHISTORIQUE RÉCENT DES LIVRABLES DE L'ENTREPRISE (pour cohérence continue) :\n";
                foreach ($context['recent_works'] as $w) {
                    $promptInjection .= "  * [" . strtoupper($w['tool_type'] ?? 'DOC') . "] " . ($w['title'] ?? 'Livrable') . " : " . mb_substr($w['summary'] ?? '', 0, 90) . "...\n";
                }
            }
            $promptInjection .= "==================================================\n";

            $context['prompt_injection'] = $promptInjection;
        }
    } catch (Exception $e) {
        // Mode dégradé silencieux sans bloquer la génération IA
    }

    return $context;
}
