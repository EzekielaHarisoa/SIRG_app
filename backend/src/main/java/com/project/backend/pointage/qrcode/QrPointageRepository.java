package com.project.backend.pointage.qrcode;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;

@Repository
public class QrPointageRepository {

    private final JdbcTemplate jdbcTemplate;

    public QrPointageRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void desactiverTous() {
        String sql = """
            UPDATE qr_pointage
            SET actif = 0
            WHERE actif = 1
            """;

        jdbcTemplate.update(sql);
    }

    public void enregistrer(QrPointage qrPointage) {
        String sql = """
            INSERT INTO qr_pointage (
                token_hash,
                date_creation,
                date_expiration,
                actif
            )
            VALUES (?, ?, ?, ?)
            """;

        jdbcTemplate.update(
                sql,
                qrPointage.getTokenHash(),
                Timestamp.valueOf(qrPointage.getDateCreation()),
                Timestamp.valueOf(qrPointage.getDateExpiration()),
                qrPointage.getActif()
        );
    }

    public boolean estValide(String tokenHash) {
        String sql = """
            SELECT COUNT(*)
            FROM qr_pointage
            WHERE token_hash = ?
              AND actif = 1
              AND date_expiration > SYSTIMESTAMP
            """;

        Integer resultat = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                tokenHash
        );

        return resultat != null && resultat > 0;
    }
}