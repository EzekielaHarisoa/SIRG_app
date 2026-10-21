
package com.project.backend.paie;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.SQLException;
import java.util.List;

@Repository
public class BulletinPaieRepository {

    private final JdbcTemplate jdbcTemplate;

    public BulletinPaieRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private BulletinPaie mapBulletinPaie(java.sql.ResultSet rs, int rowNum) throws SQLException {

        BulletinPaie bulletin = new BulletinPaie();

        bulletin.setId(rs.getLong("id"));
        bulletin.setSalaireDeBase(rs.getBigDecimal("salaire_de_base"));

        Date dateEmission = rs.getDate("date_emission");
        if (dateEmission != null) {
            bulletin.setDateEmission(dateEmission.toLocalDate());
        }

        bulletin.setTotalPrime(rs.getBigDecimal("total_prime"));
        bulletin.setSalaireBrute(rs.getBigDecimal("salaire_brute"));
        bulletin.setBaseIrsa(rs.getBigDecimal("base_irsa"));
        bulletin.setIrsa(rs.getBigDecimal("irsa"));
        bulletin.setSalaireNet(rs.getBigDecimal("salaire_net"));
        bulletin.setChargePatronal(rs.getBigDecimal("charge_patronal"));
        bulletin.setCoutGlobale(rs.getBigDecimal("cout_globale"));
        bulletin.setHeurTravaille(rs.getBigDecimal("heur_travaille"));
        bulletin.setCongeRestant(rs.getBigDecimal("conge_restant"));
        bulletin.setNumeroMatricule(rs.getLong("numero_matricule"));

        return bulletin;
    }

    public List<BulletinPaie> findAll() {
        String sql = """
            SELECT id, salaire_de_base, date_emission, total_prime,
                   salaire_brute, base_irsa, irsa, salaire_net,
                   charge_patronal, cout_globale, heur_travaille,
                   conge_restant, numero_matricule
            FROM buletin_paie
            ORDER BY date_emission DESC
            """;

        return jdbcTemplate.query(sql, this::mapBulletinPaie);
    }

    public BulletinPaie findById(long id) {
        String sql = """
            SELECT id, salaire_de_base, date_emission, total_prime,
                   salaire_brute, base_irsa, irsa, salaire_net,
                   charge_patronal, cout_globale, heur_travaille,
                   conge_restant, numero_matricule
            FROM buletin_paie
            WHERE id = ?
            """;

        List<BulletinPaie> bulletins = jdbcTemplate.query(sql, this::mapBulletinPaie, id);

        return bulletins.isEmpty() ? null : bulletins.get(0);
    }

    public List<BulletinPaie> findByNumeroMatricule(long numeroMatricule) {
        String sql = """
            SELECT id, salaire_de_base, date_emission, total_prime,
                   salaire_brute, base_irsa, irsa, salaire_net,
                   charge_patronal, cout_globale, heur_travaille,
                   conge_restant, numero_matricule
            FROM buletin_paie
            WHERE numero_matricule = ?
            ORDER BY date_emission DESC
            """;

        return jdbcTemplate.query(sql, this::mapBulletinPaie, numeroMatricule);
    }

    public int save(BulletinPaie bulletin) {
        String sql = """
            INSERT INTO buletin_paie (
                salaire_de_base, total_prime, salaire_brute,
                base_irsa, irsa, salaire_net, charge_patronal,
                cout_globale, heur_travaille, conge_restant,
                numero_matricule
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """;

        return jdbcTemplate.update(
                sql,
                bulletin.getSalaireDeBase(),
                bulletin.getTotalPrime(),
                bulletin.getSalaireBrute(),
                bulletin.getBaseIrsa(),
                bulletin.getIrsa(),
                bulletin.getSalaireNet(),
                bulletin.getChargePatronal(),
                bulletin.getCoutGlobale(),
                bulletin.getHeurTravaille(),
                bulletin.getCongeRestant(),
                bulletin.getNumeroMatricule()
        );
    }

    public BigDecimal calculerTotalPrime(long bulletinId) {
        String sql = """
            SELECT NVL(SUM(montant), 0)
            FROM prime
            WHERE buletin_paie_id = ?
            """;

        return jdbcTemplate.queryForObject(sql, BigDecimal.class, bulletinId);
    }

    public int mettreAJourTotalPrime(long bulletinId, BigDecimal totalPrime) {
        String sql = """
            UPDATE buletin_paie
            SET total_prime = ?
            WHERE id = ?
            """;

        return jdbcTemplate.update(sql, totalPrime, bulletinId);
    }

    public int mettreAJourSalaireBrut(long bulletinId, BigDecimal salaireBrut) {
        String sql = """
            UPDATE buletin_paie
            SET salaire_brute = ?
            WHERE id = ?
            """;

        return jdbcTemplate.update(sql, salaireBrut, bulletinId);
    }

    public int update(long id, BulletinPaie bulletin) {
        String sql = """
        UPDATE buletin_paie
        SET salaire_de_base = ?,
            total_prime = ?,
            salaire_brute = ?,
            base_irsa = ?,
            irsa = ?,
            salaire_net = ?,
            charge_patronal = ?,
            cout_globale = ?,
            heur_travaille = ?,
            conge_restant = ?,
            numero_matricule = ?
        WHERE id = ?
        """;

        return jdbcTemplate.update(
                sql,
                bulletin.getSalaireDeBase(),
                bulletin.getTotalPrime(),
                bulletin.getSalaireBrute(),
                bulletin.getBaseIrsa(),
                bulletin.getIrsa(),
                bulletin.getSalaireNet(),
                bulletin.getChargePatronal(),
                bulletin.getCoutGlobale(),
                bulletin.getHeurTravaille(),
                bulletin.getCongeRestant(),
                bulletin.getNumeroMatricule(),
                id
        );
    }

}
