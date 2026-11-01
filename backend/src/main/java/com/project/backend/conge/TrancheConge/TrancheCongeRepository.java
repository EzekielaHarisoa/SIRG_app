package com.project.backend.conge.TrancheConge;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;

@Repository
public class TrancheCongeRepository {

    private final JdbcTemplate jdbcTemplate;

    public TrancheCongeRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private TrancheConge mapTrancheConge(java.sql.ResultSet rs, int rowNum) throws SQLException {

        TrancheConge tranche = new TrancheConge();

        tranche.setId(rs.getLong("id"));
        tranche.setNumeroMatricule(rs.getLong("numero_matricule"));
        tranche.setAnneeCycle(rs.getInt("annee_cycle"));
        tranche.setTypeTranche(rs.getString("type_tranche"));

        Date ouverture = rs.getDate("date_ouverture");
        if (ouverture != null) {
            tranche.setDateOuverture(ouverture.toLocalDate());
        }

        Date expiration = rs.getDate("date_expiration");
        if (expiration != null) {
            tranche.setDateExpiration(expiration.toLocalDate());
        }

        tranche.setJoursAcquis(rs.getDouble("jours_acquis"));
        tranche.setStatut(rs.getString("statut"));

        return tranche;
    }

    public List<TrancheConge> findByNumeroMatricule(long numeroMatricule) {

        String sql = """
                SELECT *
                FROM tranche_conge
                WHERE numero_matricule = ?
                ORDER BY annee_cycle DESC, type_tranche
                """;

        return jdbcTemplate.query(
                sql,
                this::mapTrancheConge,
                numeroMatricule
        );
    }

    public boolean existsTranche(long numeroMatricule, int anneeCycle, String typeTranche) {

        String sql = """
                SELECT COUNT(*)
                FROM tranche_conge
                WHERE numero_matricule = ?
                  AND annee_cycle = ?
                  AND type_tranche = ?
                """;

        Integer nombre = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                numeroMatricule,
                anneeCycle,
                typeTranche
        );

        return nombre != null && nombre > 0;
    }

    public int save(TrancheConge tranche) {

        String sql = """
                INSERT INTO tranche_conge (
                    numero_matricule,
                    annee_cycle,
                    type_tranche,
                    date_ouverture,
                    date_expiration,
                    jours_acquis,
                    statut
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """;

        return jdbcTemplate.update(
                sql,
                tranche.getNumeroMatricule(),
                tranche.getAnneeCycle(),
                tranche.getTypeTranche(),
                Date.valueOf(tranche.getDateOuverture()),
                Date.valueOf(tranche.getDateExpiration()),
                tranche.getJoursAcquis(),
                tranche.getStatut()
        );
    }

    public double calculerJoursConsommes(long trancheId) {

        String sql = """
            SELECT NVL(SUM(jours_consommes), 0)
            FROM consommation_conge
            WHERE tranche_id = ?
            """;

        return jdbcTemplate.queryForObject(
                sql,
                Double.class,
                trancheId
        );
    }

    public List<TrancheConge> findTranchesDisponiblesForUpdate(long numeroMatricule, LocalDate dateDebut) {
        String sql = """
            SELECT *
            FROM tranche_conge
            WHERE numero_matricule = ?
              AND statut = 'ACTIVE'
              AND date_ouverture <= ?
              AND date_expiration > ?
            ORDER BY
                CASE type_tranche
                    WHEN 'PREMIERE' THEN 1
                    WHEN 'DEUXIEME' THEN 2
                    ELSE 3
                END,
                date_ouverture
            FOR UPDATE
            """;

        return jdbcTemplate.query(
                sql,
                this::mapTrancheConge,
                numeroMatricule,
                Date.valueOf(dateDebut),
                Date.valueOf(dateDebut)
        );
    }

    public int enregistrerConsommation(long periodeId, long trancheId, double joursConsommes) {
        String sql = """
            INSERT INTO consommation_conge (
                periode_id,
                tranche_id,
                jours_consommes
            )
            VALUES (?, ?, ?)
            """;

        return jdbcTemplate.update(
                sql,
                periodeId,
                trancheId,
                joursConsommes
        );
    }
}