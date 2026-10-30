package com.project.backend.pointage;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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
        String sql = """
        SELECT p.id,
               p.heure_entree,
               p.heure_sortie,
               p.date_pointage,
               p.heure_sup,
               p.retard_minute,
               p.numero_matricule
        FROM pointage p
        JOIN employe e
            ON p.numero_matricule = e.numero_matricule
        ORDER BY p.date_pointage DESC
        """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> mapPointage(rs)
        );
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

    public Pointage fairePointage(Pointage pointage) {
        String sql = """
        INSERT INTO pointage (
            heure_entree,
            heure_sortie,
            date_pointage,
            heure_sup,
            retard_minute,
            numero_matricule
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """;

        jdbcTemplate.update(
                sql,
                pointage.getHeureEntree() != null
                        ? Timestamp.valueOf(pointage.getHeureEntree())
                        : null,
                pointage.getHeureSortie() != null
                        ? Timestamp.valueOf(pointage.getHeureSortie())
                        : null,
                pointage.getDatePointage() != null
                        ? Date.valueOf(pointage.getDatePointage())
                        : null,
                pointage.getHeureSup(),
                pointage.getRetardMinute(),
                pointage.getNumeroMatricule()
        );

        return pointage;
    }

    public Optional<Pointage> findByMatriculeAndDate(Long numeroMatricule, LocalDate date) {

        String sql = """
            SELECT id,
                   heure_entree,
                   heure_sortie,
                   date_pointage,
                   heure_sup,
                   retard_minute,
                   numero_matricule
            FROM pointage
            WHERE numero_matricule = ?
              AND date_pointage >= ?
              AND date_pointage < ?
            ORDER BY id DESC
            FETCH FIRST 1 ROW ONLY
            """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> mapPointage(rs),
                numeroMatricule,
                Date.valueOf(date),
                Date.valueOf(date.plusDays(1))
        ).stream().findFirst();
    }


    public Pointage creerPointageJournalier(Long numeroMatricule, LocalDateTime heureEntree) {

        String sql = """
            INSERT INTO pointage (
                heure_entree,
                date_pointage,
                numero_matricule,
                heure_sup,
                retard_minute
            )
            VALUES (?, ?, ?, 0, 0)
            """;

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"ID"});

            ps.setTimestamp(1, Timestamp.valueOf(heureEntree));
            ps.setDate(2, Date.valueOf(heureEntree.toLocalDate()));
            ps.setLong(3, numeroMatricule);

            return ps;
        }, keyHolder);

        if (keyHolder.getKey() == null) {
            throw new IllegalStateException(
                    "Impossible de récupérer l'identifiant du pointage."
            );
        }

        Pointage pointage = new Pointage();
        pointage.setId(keyHolder.getKey().longValue());
        pointage.setNumeroMatricule(numeroMatricule);
        pointage.setDatePointage(heureEntree.toLocalDate());
        pointage.setHeureEntree(heureEntree);
        pointage.setHeureSup(BigDecimal.ZERO);
        pointage.setRetardMinute(0);

        return pointage;
    }

    public void mettreAJourHeureSortie(Long pointageId, LocalDateTime heureSortie) {

        String sql = """
            UPDATE pointage
            SET heure_sortie = ?
            WHERE id = ?
            """;

        int lignesModifiees = jdbcTemplate.update(
                sql,
                Timestamp.valueOf(heureSortie),
                pointageId
        );

        if (lignesModifiees != 1) {
            throw new IllegalStateException(
                    "Impossible de mettre à jour l'heure de sortie."
            );
        }
    }

    public void mettreAJourCalculs(Long pointageId, BigDecimal heureSup, Integer retardMinute) {
        String sql = """
        UPDATE pointage
        SET heure_sup = ?,
            retard_minute = ?
        WHERE id = ?
        """;

        int lignesModifiees = jdbcTemplate.update(
                sql,
                heureSup,
                retardMinute,
                pointageId
        );

        if (lignesModifiees != 1) {
            throw new IllegalStateException(
                    "Impossible de mettre à jour les calculs du pointage."
            );
        }
    }
}
