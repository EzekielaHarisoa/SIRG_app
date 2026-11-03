package com.project.backend.paie;

import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@Repository
public class PrimeRepository {

    private final JdbcTemplate jdbcTemplate;

    public PrimeRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private Prime mapPrime(ResultSet rs, int rowNum) throws SQLException {
        Prime prime = new Prime();
        prime.setId(rs.getLong("id"));
        prime.setLibelle(rs.getString("libelle"));
        prime.setMontant(rs.getBigDecimal("montant"));
        prime.setNumeroMatricule(rs.getLong("numero_matricule"));
        if (rs.wasNull()) {
            prime.setNumeroMatricule(null);
        }
        prime.setBulletinPaieId(rs.getLong("buletin_paie_id"));
        if (rs.wasNull()) {
            prime.setBulletinPaieId(null);
        }
        return prime;
    }

    public List<Prime> findAll() {
        String sql = """
            SELECT id, libelle, montant, numero_matricule, buletin_paie_id
            FROM prime
            ORDER BY buletin_paie_id NULLS LAST, id
            """;
        return jdbcTemplate.query(sql, this::mapPrime);
    }

    public List<Prime> findByNumeroMatricule(Long numeroMatricule) {
        String sql = """
            SELECT id, libelle, montant, numero_matricule, buletin_paie_id
            FROM prime
            WHERE numero_matricule = ?
            ORDER BY id
            """;
        return jdbcTemplate.query(sql, this::mapPrime, numeroMatricule);
    }

    public List<Prime> findByBulletinPaieId(Long bulletinPaieId) {
        String sql = """
            SELECT id, libelle, montant, numero_matricule, buletin_paie_id
            FROM prime
            WHERE buletin_paie_id = ?
            ORDER BY id
            """;
        return jdbcTemplate.query(sql, this::mapPrime, bulletinPaieId);
    }

    public Prime findById(Long id) {
        String sql = """
            SELECT id, libelle, montant, numero_matricule, buletin_paie_id
            FROM prime
            WHERE id = ?
            """;
        List<Prime> primes = jdbcTemplate.query(sql, this::mapPrime, id);
        return primes.isEmpty() ? null : primes.get(0);
    }

    public Integer save(Prime prime) {
        validateExistence(prime.getNumeroMatricule());

        String sql;
        if (prime.getId() == null) {
            sql = """
                INSERT INTO prime (libelle, montant, numero_matricule, buletin_paie_id)
                VALUES (?, ?, ?, ?)
                """;
            return jdbcTemplate.update(
                sql,
                prime.getLibelle(),
                prime.getMontant(),
                prime.getNumeroMatricule(),
                prime.getBulletinPaieId()
            );
        }
        return update(prime);
    }

    public Integer update(Prime prime) {
        validateExistence(prime.getNumeroMatricule());

        String sql = """
            UPDATE prime
            SET libelle = ?,
                montant = ?,
                numero_matricule = ?,
                buletin_paie_id = ?
            WHERE id = ?
            """;
        return jdbcTemplate.update(
            sql,
            prime.getLibelle(),
            prime.getMontant(),
            prime.getNumeroMatricule(),
            prime.getBulletinPaieId(),
            prime.getId()
        );
    }

    public Integer delete(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("L'identifiant de la prime est invalide");
        }

        Integer deleted = jdbcTemplate.update("DELETE FROM prime WHERE id = ?", id);
        if (deleted == 0) {
            throw new PrimeNotFoundException(id);
        }
        return deleted;
    }

    private void validateExistence(Long numeroMatricule) {
        if (numeroMatricule == null || numeroMatricule <= 0) {
            throw new IllegalArgumentException("Le numéro matricule est obligatoire");
        }

        String sql = "SELECT COUNT(*) FROM employe WHERE numero_matricule = ?";
        Integer count;
        try {
            count = jdbcTemplate.queryForObject(sql, Integer.class, numeroMatricule);
        } catch (DataAccessException e) {
            throw new IllegalArgumentException(
                "Impossible de vérifier le numéro matricule : employé introuvable");
        }

        if (count == null || count == 0) {
            throw new IllegalArgumentException("L'employé avec le numéro matricule " + numeroMatricule + " n'existe pas");
        }
    }

    public BigDecimal calculerTotalPrime(Prime prime) {
        Long bulletinId = prime.getBulletinPaieId();
        if (bulletinId == null) {
            return BigDecimal.ZERO;
        }

        String sql = "SELECT NVL(SUM(montant), 0) FROM prime WHERE buletin_paie_id = ?";
        return jdbcTemplate.queryForObject(sql, BigDecimal.class, bulletinId);
    }
}
