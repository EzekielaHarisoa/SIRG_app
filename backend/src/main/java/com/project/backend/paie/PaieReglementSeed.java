package com.project.backend.paie;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Référentiel des cotisations utilisé pour construire la fiche de paie.
 * Contraintes du schéma :
 *   - CODE est un VARCHAR2(20) → tous les codes doivent tenir en 20 caractères.
 *   - ORDRE définit l'ordre d'affichage des rubriques sur la fiche.
 *   - TYPE_BASE = 'MONTANT' → TAUX_PATRONAL porte un montant fixe en euros, pas un pourcentage.
 * Le seed est idempotent (clé = code).
 */
@Component
@Order(2)
public class PaieReglementSeed implements CommandLineRunner {

    private final JdbcTemplate jdbc;

    public PaieReglementSeed(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(String... args) {
        try {
            seedCotisations();
        } catch (Exception e) {
            System.out.println("[PaieReglementSeed] seed cotisations ignoré : " + e.getMessage());
        }
    }

    private void seedCotisations() {
        // Ordre visuel fidèle à la fiche cible. Taux en pourcent (13,00 -> 13.00).
        int ordre = 10;
        ordre = insert("SALAIRE BRUT", "SALAIRE_BRUT", "SALAIRE BRUT", false, null, null, "SBC", ordre);
        ordre = insert("SANTE", "SANTE", "SANTE", false, null, null, "SECTION", ordre);
        ordre = insert("SECURITE_SOCIALE", "SECURITE_SOCIALE", "Securite sociale", false, null, new BigDecimal("13.00"), "SBC", ordre);
        ordre = insert("ATMP", "ATMP", "Accidents du travail - maladies professionnelles", false, null, new BigDecimal("2.80"), "SBC", ordre);
        ordre = insert("RETRAITE", "RETRAITE", "RETRAITE", false, null, null, "SECTION", ordre);
        ordre = insert("AVD", "AV_DEP", "Assurance Vieillesse deplafonnee", true, new BigDecimal("0.40"), new BigDecimal("1.90"), "SBC", ordre);
        ordre = insert("AVP", "AV_PLAF", "Assurance Vieillesse plafonnee", true, new BigDecimal("6.90"), new BigDecimal("8.55"), "SBC", ordre);
        ordre = insert("ARRCO_A", "ARRCO_A", "Retraite complementaire tranche A ARRCO", true, new BigDecimal("3.10"), new BigDecimal("4.65"), "SBC", ordre);
        ordre = insert("AGFF_A", "AGFF_A", "Retraite complementaire AGFF tranche A", true, new BigDecimal("0.80"), new BigDecimal("1.20"), "SBC", ordre);
        ordre = insert("GMP", "GMP", "Retraite complementaire GMP", false, null, null, "SBC", ordre);
        ordre = insert("FAMILLE", "FAMILLE_SS", "FAMILLE - SECURITE SOCIALE", false, null, new BigDecimal("3.45"), "SBC", ordre);
        ordre = insert("CHOMAGE", "ASSURANCE_CHOMAGE", "ASSURANCE CHOMAGE", false, null, null, "SECTION", ordre);
        ordre = insert("CHOMAGE_TR1", "CHOMAGE_TR1", "Assurance chomage tranche 1", true, new BigDecimal("0.95"), new BigDecimal("4.05"), "SBC", ordre);
        ordre = insert("AGS", "AGS_FNGS", "Assurance chomage tranche AGS (FNGS)", false, null, new BigDecimal("0.15"), "SBC", ordre);
        ordre = insert("CSG_DEDUCTIBLE", "CSG_DEDUCTIBLE", "CSG deductible", true, new BigDecimal("6.80"), null, "SBC_PLAFONNE", ordre);
        insert("AUTRES_CONTRIBUTIONS", "AUTRES_CONTRIB", "Autres contributions dues par l'employeur", false, null, new BigDecimal("25.56"), "MONTANT", ordre);
    }

    /** Insère la rubrique si absente et met à jour son ordre. Retourne l'ordre suivant. */
    private int insert(String famille, String code, String libelle, boolean estSalariale,
                       BigDecimal tauxSalarial, BigDecimal tauxPatronal, String typeBase, int ordre) {
        try {
            Integer dejaLa = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM cotisation_reglement WHERE code = ?", Integer.class, code);
            if (dejaLa != null && dejaLa > 0) {
                jdbc.update("UPDATE cotisation_reglement SET famille = ?, libelle = ?, est_salarial = ?, "
                                + "taux_salarial = ?, taux_patronal = ?, type_base = ?, ordre = ? WHERE code = ?",
                        famille, libelle, estSalariale ? "O" : "N", tauxSalarial, tauxPatronal, typeBase, ordre, code);
            } else {
                Long nextId = jdbc.queryForObject(
                        "SELECT NVL(MAX(id), 0) + 1 FROM cotisation_reglement", Long.class);
                jdbc.update("INSERT INTO cotisation_reglement (id, famille, code, libelle, est_salarial, "
                                + "taux_salarial, taux_patronal, type_base, ordre) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        nextId, famille, code, libelle, estSalariale ? "O" : "N",
                        tauxSalarial, tauxPatronal, typeBase, ordre);
            }
        } catch (Exception e) {
            System.out.println("[PaieReglementSeed] rubrique ignorée (" + code + ") : " + e.getMessage());
        }
        return ordre + 10;
    }
}
