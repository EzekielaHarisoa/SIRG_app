package com.project.backend.conge;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.sql.Date;
import java.time.LocalDate;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
public class SoldeCongeRepository {
    private final JdbcTemplate jdbcTemplate;

    public SoldeCongeRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public SoldeConge mapSoldeConge(java.sql.ResultSet rs, int nrw) throws SQLException {
        SoldeConge soldeConge = new SoldeConge();

        soldeConge.setId(rs.getLong("id"));
        soldeConge.setNumeroMatricule(rs.getLong("numero_matricule"));
        soldeConge.setAnnee(rs.getInt("annee"));
        soldeConge.setSoldeInitial(rs.getBigDecimal("solde_initial"));
        soldeConge.setJoursAcquis(rs.getBigDecimal("jours_acquis"));
        soldeConge.setJoursPris(rs.getBigDecimal("jours_pris"));
        soldeConge.setSoldeRestant(rs.getBigDecimal("solde_restant"));

        return soldeConge;

    }

    public List<SoldeConge> findByNumeroMatricule(long numeroMatricule) {
        String sql = """
            SELECT id, numero_matricule, annee,
                   solde_initial, jours_acquis,
                   jours_pris, solde_restant
            FROM solde_conges
            WHERE numero_matricule = ?
            ORDER BY annee DESC
            """;

        return jdbcTemplate.query(
                sql, this::mapSoldeConge, numeroMatricule
        );
    }

    public Optional<SoldeConge> getSoldeByNumeroMatriculeAndAnnee(long numeroMatricule, int annee) {
        String sql = """
                SELECT  
                        id,
                        numero_matricule,
                        annee,
                        solde_initial,
                        jours_acquis, 
                        jours_pris,  
                        solde_restant
                FROM    solde_conges
                WHERE   numero_matricule = ? AND annee = ?
               """;
        List<SoldeConge> resultat =  jdbcTemplate.query(sql, this::mapSoldeConge, numeroMatricule,annee);

        return resultat.stream().findFirst();
    }


    public boolean existsByNumeroMatriculeAndAnnee(
            long numeroMatricule, int annee) {

        String sql = """
        SELECT COUNT(*)
        FROM solde_conges
        WHERE numero_matricule = ?
          AND annee = ?
        """;

        Integer count = jdbcTemplate.queryForObject(
                sql, Integer.class, numeroMatricule, annee
        );

        return count != null && count > 0;
    }


    public int save(SoldeConge soldeConge) {
        String sql = """
        INSERT INTO solde_conges (
            numero_matricule,
            annee,
            solde_initial,
            jours_acquis,
            jours_pris,
            solde_restant
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """;

        return jdbcTemplate.update(
                sql,
                soldeConge.getNumeroMatricule(),
                soldeConge.getAnnee(),
                soldeConge.getSoldeInitial(),
                soldeConge.getJoursAcquis(),
                soldeConge.getJoursPris(),
                soldeConge.getSoldeRestant()
        );
    }

    public int update(SoldeConge soldeConge) {
        String sql = """
            UPDATE solde_conges
            SET
                numsero_matricule = ?,
                solde_initial = ?,
                jours_acquis = ?,
                jours_pris = ?,
                solde_restant = ?
            WHERE numero_matricule = ?
              AND annee = ?
            """;

        return jdbcTemplate.update(
                sql,
                soldeConge.getNumeroMatricule(),
                soldeConge.getSoldeInitial(),
                soldeConge.getJoursAcquis(),
                soldeConge.getJoursPris(),
                soldeConge.getSoldeRestant(),
                soldeConge.getNumeroMatricule(),
                soldeConge.getAnnee()
        );
    }

    public LocalDate findDateEmbauche(long numeroMatricule) {
        String sql = """
        SELECT date_embauche
        FROM employe
        WHERE numero_matricule = ?
        """;

        List<Date> dates = jdbcTemplate.query(
                sql,
                (rs, rowNum) -> rs.getDate("date_embauche"),
                numeroMatricule
        );

        if (dates.isEmpty()) {
            throw new IllegalArgumentException(
                    "Aucun employé trouvé pour le matricule : "
                            + numeroMatricule
            );
        }

        Date date = dates.get(0);

        if (date == null) {
            throw new IllegalArgumentException(
                    "La date d'embauche est absente pour le matricule : "
                            + numeroMatricule
            );
        }

        return date.toLocalDate();
    }    public java.math.BigDecimal calculerJoursPris(long numeroMatricule, int annee) {

        LocalDate debutAnnee = LocalDate.of(annee, 1, 1);
        LocalDate finAnnee = LocalDate.of(annee, 12, 31);

        String sql = """
        SELECT NVL(
            SUM( LEAST(date_fin, ?) - GREATEST(date_de_debut, ?) + 1),
            0
        )
        FROM demande_conges
        WHERE numero_matricule = ?
          AND status = 'ACCEPTER'
          AND type_conge = 'CONGE_PAYE'
          AND date_de_debut <= ?
          AND date_fin >= ?
        """;

        return jdbcTemplate.queryForObject(
                sql,
                java.math.BigDecimal.class,
                Date.valueOf(finAnnee),
                Date.valueOf(debutAnnee),
                numeroMatricule,
                Date.valueOf(finAnnee),
                Date.valueOf(debutAnnee)
        );
    }

}
