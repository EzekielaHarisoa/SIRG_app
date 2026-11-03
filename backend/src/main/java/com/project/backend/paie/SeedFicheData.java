package com.project.backend.paie;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.time.LocalDate;

/**
 * Insère (ou met à jour) le jeu de données de démonstration utilisé par la fiche de paie.
 * Schéma réel Oracle :
 *   ENTREPRISE(id identity, nom, adresse, siret, code_naf, matricule_urssaf, convention, adresse_complete)
 *   POSTE(id identity, titre, salaire_de_base, qualification, coefficient)
 *   EMPLOYE(numero_matricule identity, nom_et_prenoms, telephone, adresse, date_embauche,
 *           entreprise_id, poste_id, numero_securite_sociale, entree_le, emploi, type_contrat)
 *   BULETIN_PAIE(id identity, salaire_de_base, date_emission, total_prime, salaire_brute,
 *                base_irsa, irsa, salaire_net, charge_patronal, cout_globale,
 *                heur_travaille, conge_restant, numero_matricule)
 * Les colonnes IDENTITY ne sont jamais écrites : Oracle les génère.
 */
public class SeedFicheData {

    public static void main(String[] args) throws Exception {
        Class.forName("oracle.jdbc.OracleDriver");
        try (Connection conn = DriverManager.getConnection(
                "jdbc:oracle:thin:@localhost:1521/XEPDB1", "sirg_app", "chatonnofy")) {
            conn.setAutoCommit(false);
            try {
                long entrepriseId = upsertEntreprise(conn,
                        "Dotnet (Sas)",
                        "45, Rue Des Maraîchers,\n44300 Nantes",
                        "81322216300012", "4791A", "U257", "Vente à distance");
                long posteId = upsertPoste(conn, "Ct Pro Develop.logiciel",
                        new BigDecimal("800000.00"), "Non Cadre", new BigDecimal("100"));
                long matricule = upsertEmploye(conn,
                        "Freddy Clement", "0240000000",
                        "1 bld Alexandre MILLRAND,\n44200 Nantes",
                        LocalDate.of(2017, 3, 20), entrepriseId, posteId,
                        "189104900735074", "Ct Pro Develop.logiciel", "CDD");
                // Totaux cohérents avec le référentiel de cotisations (voir fiche de paie)
                long bulletinId = upsertBulletin(conn, matricule,
                        new BigDecimal("1498.50"), LocalDate.of(2018, 6, 30),
                        new BigDecimal("1498.50"), new BigDecimal("1498.50"),
                        new BigDecimal("0.00"), new BigDecimal("1216.31"),
                        new BigDecimal("621.21"), new BigDecimal("2119.71"),
                        new BigDecimal("0.00"));
                conn.commit();
                System.out.println("SEED OK -> entreprise=" + entrepriseId
                        + " poste=" + posteId
                        + " matricule=" + matricule
                        + " bulletin=" + bulletinId);
            } catch (Exception e) {
                conn.rollback();
                throw e;
            }
        }
    }

    private static long upsertEntreprise(Connection conn, String nom, String adresse,
                                         String siret, String codeNaf, String matriculeUrssaf,
                                         String convention) throws SQLException {
        Long existing = queryLong(conn, "SELECT id FROM entreprise WHERE nom = ?", nom);
        if (existing == null) {
            existing = queryLong(conn, "SELECT MIN(id) FROM entreprise");
        }
        if (existing == null) {
            exec(conn, "INSERT INTO entreprise (nom, adresse, adresse_complete, siret, code_naf, matricule_urssaf, convention) "
                            + "VALUES (?, ?, ?, ?, ?, ?, ?)",
                    nom, adresse, adresse, siret, codeNaf, matriculeUrssaf, convention);
            return queryLong(conn, "SELECT MAX(id) FROM entreprise");
        }
        exec(conn, "UPDATE entreprise SET nom = ?, adresse = ?, adresse_complete = ?, siret = ?, "
                        + "code_naf = ?, matricule_urssaf = ?, convention = ? WHERE id = ?",
                nom, adresse, adresse, siret, codeNaf, matriculeUrssaf, convention, existing);
        return existing;
    }

    private static long upsertPoste(Connection conn, String titre, BigDecimal salaireDeBase,
                                    String qualification, BigDecimal coefficient) throws SQLException {
        Long existing = queryLong(conn, "SELECT id FROM poste WHERE titre = ?", titre);
        if (existing == null) {
            existing = queryLong(conn, "SELECT MIN(id) FROM poste");
        }
        if (existing == null) {
            exec(conn, "INSERT INTO poste (titre, salaire_de_base, qualification, coefficient) VALUES (?, ?, ?, ?)",
                    titre, salaireDeBase, qualification, coefficient);
            return queryLong(conn, "SELECT MAX(id) FROM poste");
        }
        exec(conn, "UPDATE poste SET titre = ?, salaire_de_base = ?, qualification = ?, coefficient = ? WHERE id = ?",
                titre, salaireDeBase, qualification, coefficient, existing);
        return existing;
    }

    private static long upsertEmploye(Connection conn, String nomComplet, String telephone,
                                      String adresse, LocalDate dateEmbauche, long entrepriseId,
                                      long posteId, String numeroSecuriteSociale, String emploi,
                                      String typeContrat) throws SQLException {
        Long existing = queryLong(conn, "SELECT numero_matricule FROM employe WHERE nom_et_prenoms = ?", nomComplet);
        if (existing != null) {
            exec(conn, "UPDATE employe SET telephone = ?, adresse = ?, date_embauche = ?, entreprise_id = ?, "
                            + "poste_id = ?, numero_securite_sociale = ?, entree_le = ?, emploi = ?, type_contrat = ? "
                            + "WHERE numero_matricule = ?",
                    telephone, adresse, dateEmbauche, entrepriseId, posteId, numeroSecuriteSociale,
                    dateEmbauche, emploi, typeContrat, existing);
            return existing;
        }
        exec(conn, "INSERT INTO employe (nom_et_prenoms, telephone, adresse, date_embauche, entreprise_id, "
                        + "poste_id, numero_securite_sociale, entree_le, emploi, type_contrat) "
                        + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                nomComplet, telephone, adresse, dateEmbauche, entrepriseId, posteId,
                numeroSecuriteSociale, dateEmbauche, emploi, typeContrat);
        return queryLong(conn, "SELECT MAX(numero_matricule) FROM employe");
    }

    private static long upsertBulletin(Connection conn, long matricule, BigDecimal salaireDeBase,
                                       LocalDate dateEmission, BigDecimal salaireBrute,
                                       BigDecimal baseIrsa, BigDecimal irsa, BigDecimal salaireNet,
                                       BigDecimal chargePatronal, BigDecimal coutGlobal,
                                       BigDecimal heurTravaille) throws SQLException {
        Long existing = queryLong(conn,
                "SELECT id FROM buletin_paie WHERE numero_matricule = ? AND date_emission = ?",
                matricule, dateEmission);
        if (existing != null) {
            exec(conn, "UPDATE buletin_paie SET salaire_de_base = ?, salaire_brute = ?, base_irsa = ?, irsa = ?, "
                            + "salaire_net = ?, charge_patronal = ?, cout_globale = ?, heur_travaille = ? "
                            + "WHERE id = ?",
                    salaireDeBase, salaireBrute, baseIrsa, irsa, salaireNet,
                    chargePatronal, coutGlobal, heurTravaille, existing);
            return existing;
        }
        exec(conn, "INSERT INTO buletin_paie (salaire_de_base, date_emission, total_prime, salaire_brute, "
                        + "base_irsa, irsa, salaire_net, charge_patronal, cout_globale, heur_travaille, "
                        + "conge_restant, numero_matricule) "
                        + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                salaireDeBase, dateEmission, BigDecimal.ZERO, salaireBrute, baseIrsa, irsa,
                salaireNet, chargePatronal, coutGlobal, heurTravaille, new BigDecimal("0.00"), matricule);
        return queryLong(conn, "SELECT MAX(id) FROM buletin_paie");
    }

    // ---------- helpers ----------

    private static void exec(Connection conn, String sql, Object... params) throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            bind(ps, params);
            ps.executeUpdate();
        }
    }

    private static Long queryLong(Connection conn, String sql, Object... params) throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            bind(ps, params);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    long v = rs.getLong(1);
                    return rs.wasNull() ? null : v;
                }
            }
        }
        return null;
    }

    private static void bind(PreparedStatement ps, Object... params) throws SQLException {
        for (int i = 0; i < params.length; i++) {
            Object v = params[i];
            int idx = i + 1;
            if (v == null) {
                ps.setNull(idx, Types.NULL);
            } else if (v instanceof LocalDate d) {
                ps.setDate(idx, java.sql.Date.valueOf(d));
            } else if (v instanceof BigDecimal bd) {
                ps.setBigDecimal(idx, bd);
            } else if (v instanceof Long l) {
                ps.setLong(idx, l);
            } else if (v instanceof Number n) {
                ps.setObject(idx, n);
            } else {
                ps.setString(idx, v.toString());
            }
        }
    }
}
