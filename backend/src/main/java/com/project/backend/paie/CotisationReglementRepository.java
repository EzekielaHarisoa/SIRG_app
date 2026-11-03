package com.project.backend.paie;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class CotisationReglementRepository {

    private final JdbcTemplate jdbcTemplate;

    public CotisationReglementRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<CotisationReglement> findAll() {
        String sql = """
            SELECT id, famille, code, libelle,
                   CASE WHEN est_salarial = 'O' THEN 1 ELSE 0 END AS est_salarial_num,
                   taux_salarial, taux_patronal, type_base
            FROM cotisation_reglement
            ORDER BY NVL(ordre, 999), id
            """;
        return jdbcTemplate.query(sql, this::mapCotisation);
    }

    public List<CotisationReglement> findBySection(String famille) {
        String sql = """
            SELECT id, famille, code, libelle,
                   CASE WHEN est_salarial = 'O' THEN 1 ELSE 0 END AS est_salarial_num,
                   taux_salarial, taux_patronal, type_base
            FROM cotisation_reglement
            WHERE famille = ?
            ORDER BY NVL(ordre, 999), id
            """;
        return jdbcTemplate.query(sql, this::mapCotisation, famille);
    }

    public Long save(CotisationReglement c) {
        String sql = """
            INSERT INTO cotisation_reglement (id, famille, code, libelle, est_salarial, taux_salarial, taux_patronal, type_base)
            VALUES (seq_cotisation_reglement.nextval, ?, ?, ?, ?, ?, ?, ?)
            """;
        jdbcTemplate.update(sql,
                c.getFamille(),
                c.getCode(),
                c.getLibelle(),
                c.isEstSalariale() ? "O" : "N",
                c.getTauxSalarial(),
                c.getTauxPatronal(),
                c.getTypeBase());
        return findMaxId();
    }

    public Integer delete(Long id) {
        return jdbcTemplate.update("DELETE FROM cotisation_reglement WHERE id = ?", id);
    }

    public CotisationReglement findById(Long id) {
        String sql = """
            SELECT id, famille, code, libelle,
                   CASE WHEN est_salarial = 'O' THEN 1 ELSE 0 END AS est_salarial_num,
                   taux_salarial, taux_patronal, type_base
            FROM cotisation_reglement
            WHERE id = ?
            """;
        List<CotisationReglement> list = jdbcTemplate.query(sql, this::mapCotisation, id);
        return list.isEmpty() ? null : list.get(0);
    }

    public BigDecimal findTauxSalarial(Long id) {
        String sql = "SELECT nvl(taux_salarial, 0) FROM cotisation_reglement WHERE id = ?";
        // (les montants fixes utilisent TYPE_BASE = 'MONTANT' côté service)
        List<BigDecimal> list = jdbcTemplate.queryForList(sql, BigDecimal.class, id);
        return list.isEmpty() ? BigDecimal.ZERO : list.get(0);
    }

    public BigDecimal findTauxPatronal(Long id) {
        String sql = "SELECT nvl(taux_patronal, 0) FROM cotisation_reglement WHERE id = ?";
        List<BigDecimal> list = jdbcTemplate.queryForList(sql, BigDecimal.class, id);
        return list.isEmpty() ? BigDecimal.ZERO : list.get(0);
    }

    public String findLibelle(Long id) {
        String sql = "SELECT libelle FROM cotisation_reglement WHERE id = ?";
        List<String> list = jdbcTemplate.queryForList(sql, String.class, id);
        return list.isEmpty() ? null : list.get(0);
    }

    public String findFamille(Long id) {
        String sql = "SELECT famille FROM cotisation_reglement WHERE id = ?";
        List<String> list = jdbcTemplate.queryForList(sql, String.class, id);
        return list.isEmpty() ? null : list.get(0);
    }

    public boolean estSalariale(Long id) {
        String sql = "SELECT nvl(est_salarial, 'N') FROM cotisation_reglement WHERE id = ?";
        String val = jdbcTemplate.queryForObject(sql, String.class, id);
        return "O".equals(val);
    }

    public Long getNextId() {
        return jdbcTemplate.queryForObject("SELECT seq_cotisation_reglement.nextval FROM dual", Long.class);
    }

    private Long findMaxId() {
        try {
            return jdbcTemplate.queryForObject("SELECT NVL(MAX(id), 0) FROM cotisation_reglement", Long.class);
        } catch (Exception e) {
            return 1L;
        }
    }

    private CotisationReglement mapCotisation(ResultSet rs, int rowNum) throws SQLException {
        CotisationReglement c = new CotisationReglement();
        c.setId(rs.getLong("id"));
        c.setFamille(rs.getString("famille"));
        c.setCode(rs.getString("code"));
        c.setLibelle(rs.getString("libelle"));
        c.setEstSalariale(rs.getBoolean("est_salarial_num"));
        c.setTauxSalarial(rs.getBigDecimal("taux_salarial"));
        c.setTauxPatronal(rs.getBigDecimal("taux_patronal"));
        c.setTypeBase(rs.getString("type_base"));
        return c;
    }
}
