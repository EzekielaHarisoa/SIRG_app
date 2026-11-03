package com.project.backend.paie;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class LigneCotisationRepository {

    private final JdbcTemplate jdbcTemplate;

    public LigneCotisationRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<LigneCotisation> findByBulletinPaieId(Long bulletinPaieId) {
        String sql = """
            SELECT id, bulletin_paie_id, cotisation_reglement_id,
                   base, cotisation_salariale, cotisation_patronale
            FROM ligne_cotisation
            WHERE bulletin_paie_id = ?
            ORDER BY id
            """;
        return jdbcTemplate.query(sql, this::mapLigne, bulletinPaieId);
    }

    public LigneCotisation save(LigneCotisation l) {
        String sql;
        if (l.getId() == null) {
            sql = """
                INSERT INTO ligne_cotisation (id, bulletin_paie_id, cotisation_reglement_id, base, cotisation_salariale, cotisation_patronale)
                VALUES (seq_ligne_cotisation.nextval, ?, ?, ?, ?, ?)
                """;
            jdbcTemplate.update(sql,
                    l.getBulletinPaieId(),
                    l.getCotisationReglementId(),
                    l.getBase(),
                    l.getCotisationSalariale(),
                    l.getCotisationPatronale());
            l.setId(findMaxId());
        } else {
            sql = """
                UPDATE ligne_cotisation
                SET bulletin_paie_id = ?, cotisation_reglement_id = ?, base = ?, cotisation_salariale = ?, cotisation_patronale = ?
                WHERE id = ?
                """;
            jdbcTemplate.update(sql,
                    l.getBulletinPaieId(),
                    l.getCotisationReglementId(),
                    l.getBase(),
                    l.getCotisationSalariale(),
                    l.getCotisationPatronale(),
                    l.getId());
        }
        return l;
    }

    public Integer deleteByBulletinPaieId(Long bulletinPaieId) {
        return jdbcTemplate.update("DELETE FROM ligne_cotisation WHERE bulletin_paie_id = ?", bulletinPaieId);
    }

    public BigDecimal totalCotisationsSalariales(Long bulletinPaieId) {
        String sql = "SELECT NVL(SUM(cotisation_salariale), 0) FROM ligne_cotisation WHERE bulletin_paie_id = ?";
        return jdbcTemplate.queryForObject(sql, BigDecimal.class, bulletinPaieId);
    }

    public BigDecimal totalCotisationsPatronales(Long bulletinPaieId) {
        String sql = "SELECT NVL(SUM(cotisation_patronale), 0) FROM ligne_cotisation WHERE bulletin_paie_id = ?";
        return jdbcTemplate.queryForObject(sql, BigDecimal.class, bulletinPaieId);
    }

    private Long findMaxId() {
        try {
            return jdbcTemplate.queryForObject("SELECT NVL(MAX(id), 0) FROM ligne_cotisation", Long.class);
        } catch (Exception e) {
            return 1L;
        }
    }

    private LigneCotisation mapLigne(ResultSet rs, int rowNum) throws SQLException {
        LigneCotisation l = new LigneCotisation();
        l.setId(rs.getLong("id"));
        l.setBulletinPaieId(rs.getLong("bulletin_paie_id"));
        l.setCotisationReglementId(rs.getLong("cotisation_reglement_id"));
        l.setBase(rs.getBigDecimal("base"));
        l.setCotisationSalariale(rs.getBigDecimal("cotisation_salariale"));
        l.setCotisationPatronale(rs.getBigDecimal("cotisation_patronale"));
        return l;
    }
}
