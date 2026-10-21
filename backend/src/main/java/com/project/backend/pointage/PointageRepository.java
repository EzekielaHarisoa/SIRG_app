package com.project.backend.pointage;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.sql.Date;
import java.util.List;

@Repository
public class PointageRepository {
    private final JdbcTemplate jdbcTemplate;

    public PointageRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private Pointage mapPointage(ResultSet rs) throws SQLException {
        Pointage pointage = new Pointage();
        pointage.setId(rs.getLong("id"));

        Timestamp entree = rs.getTimestamp("heure_entree");
        if(entree != null) {
            pointage.setHeureEntree(entree.toLocalDateTime());
        }

        Timestamp sortie = rs.getTimestamp("heure_sortie");
        if(sortie != null) {
            pointage.setHeureSortie(sortie.toLocalDateTime());
        }


        Date datePointage = rs.getDate("date_pointage");
        if (datePointage != null) {
            pointage.setDatePointage(datePointage.toLocalDate());        }

        pointage.setHeureSup(rs.getBigDecimal("heure_sup"));

        int retard = rs.getInt("retard_minute");
        if (!rs.wasNull()) {
            pointage.setRetardMinute(retard);
        }

        pointage.setNumeroMatricule(rs.getLong("numero_matricule"));

        return pointage;

    }

    public List<Pointage> findAllPointage() {
        String sql= """
                SELECT p.heure_entree,
                    p.id
                    p.heure_sortie,
                    p.date_pointage,
                    p.heure_sup, 
                    p.retard_minute, 
                    e.nom_et_prenoms 
                FROM pointage p
                JOIN employe e
                ON p.numero_matricule = e.numero_matricule
                ORDER BY p.date_pointage DESC
                    """;

        return jdbcTemplate.query(sql, (rs, nrw) -> mapPointage(rs));

    }

    public List<Pointage> findPointageByDate(LocalDate date) {
        String sql = """
                SELECT p.id, p.heure_entree, p.heure_sortie,
                       p.date_pointage, p.heure_sup, p.retard_minute,
                       p.numero_matricule
                FROM pointage p
                JOIN employe e
                    ON p.numero_matricule = e.numero_matricule
                WHERE p.date_pointage >= ?
                  AND p.date_pointage < ?
                ORDER BY p.heure_entree
                """;

        LocalDateTime debut = date.atStartOfDay();
        LocalDateTime fin = date.plusDays(1).atStartOfDay();

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> mapPointage(rs),
                Timestamp.valueOf(debut),
                Timestamp.valueOf(fin)
        );
    }

    public List<Pointage> findPointageByNumeroMatricule(long numeroMatricule) {
        String sql = "select * from pointage where  numero_matricule = ?";

        return jdbcTemplate.query(
                sql,
                (rs, nrw) -> mapPointage(rs),
                numeroMatricule
        );

    }

    public  Pointage fairePointage(Pointage pointage) {
        String sql =
                """
                INSERT INTO pointage(
                    heure_entree,
                    heure_sortie,
                    date_pointage,
                    heure_sup,
                    retard_minute,
                    numero_matricule)
                VALUES( ?, ?, ?, ?, ?, ?)    
                """;

        jdbcTemplate.update(
                sql,
                Timestamp.valueOf(pointage.getHeureEntree()),
                pointage.getHeureSortie() != null ? Timestamp.valueOf(pointage.getHeureSortie()) : null,
                Date.valueOf(pointage.getDatePointage()),
                pointage.getHeureSup(),
                pointage.getRetardMinute(),
                pointage.getNumeroMatricule()
        );

        return pointage;

    }

}
