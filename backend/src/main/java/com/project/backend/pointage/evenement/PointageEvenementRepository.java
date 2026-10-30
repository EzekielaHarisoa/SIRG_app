
package com.project.backend.pointage.evenement;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;


@Repository
public class PointageEvenementRepository {

    private final JdbcTemplate jdbcTemplate;

    public PointageEvenementRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private PointageEvenement mapEvenement(ResultSet rs) throws SQLException {

        PointageEvenement evenement = new PointageEvenement();

        evenement.setId(rs.getLong("id"));
        evenement.setPointageId(rs.getLong("pointage_id"));

        evenement.setTypeEvenement(
                TypeEvenement.valueOf(rs.getString("type_evenement"))
        );

        Timestamp dateHeure = rs.getTimestamp("date_heure");

        if (dateHeure != null) {
            evenement.setDateHeure(dateHeure.toLocalDateTime());
        }

        evenement.setModePointage(rs.getString("mode_pointage"));

        return evenement;
    }

    public PointageEvenement save(PointageEvenement evenement) {

        String sql = """
            INSERT INTO pointage_evenement (
                pointage_id,
                type_evenement,
                date_heure,
                mode_pointage
            )
            VALUES (?, ?, ?, ?)
            """;

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {

            PreparedStatement ps = connection.prepareStatement(
                    sql,
                    new String[]{"ID"}
            );

            ps.setLong(1, evenement.getPointageId());
            ps.setString(2, evenement.getTypeEvenement().name());
            ps.setTimestamp(3, Timestamp.valueOf(evenement.getDateHeure()));
            ps.setString(4, evenement.getModePointage());

            return ps;

        }, keyHolder);

        if (keyHolder.getKey() == null) {
            throw new IllegalStateException(
                    "Impossible de récupérer l'identifiant de l'événement."
            );
        }

        evenement.setId(keyHolder.getKey().longValue());

        return evenement;
    }

    public List<PointageEvenement> findByPointageId(Long pointageId) {

        String sql = """
                SELECT id,
                       pointage_id,
                       type_evenement,
                       date_heure,
                       mode_pointage
                FROM pointage_evenement
                WHERE pointage_id = ?
                ORDER BY date_heure ASC, id ASC
                """;

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> mapEvenement(rs),
                pointageId
        );
    }

    public Optional<PointageEvenement> findLastByPointageId(Long pointageId) {

        String sql = """
                SELECT id,
                       pointage_id,
                       type_evenement,
                       date_heure,
                       mode_pointage
                FROM pointage_evenement
                WHERE pointage_id = ?
                ORDER BY date_heure DESC, id DESC
                FETCH FIRST 1 ROW ONLY
                """;

        List<PointageEvenement> resultats = jdbcTemplate.query(
                sql,
                (rs, rowNum) -> mapEvenement(rs),
                pointageId
        );

        return resultats.stream().findFirst();
    }



}
