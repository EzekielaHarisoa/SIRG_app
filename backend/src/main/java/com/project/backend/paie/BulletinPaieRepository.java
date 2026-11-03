
package com.project.backend.paie;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Types;
import java.util.List;
import java.util.Map;

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

    /**
     * Insère un bulletin et renvoie son identifiant généré.
     * DATE_EMISSION est NOT NULL en base : elle est toujours fournie
     * (par défaut, la date du jour).
     */
    public long save(BulletinPaie bulletin) {
        String sql = """
            INSERT INTO buletin_paie (
                salaire_de_base, date_emission, total_prime, salaire_brute,
                base_irsa, irsa, salaire_net, charge_patronal,
                cout_globale, heur_travaille, conge_restant,
                numero_matricule
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """;

        java.time.LocalDate emission = bulletin.getDateEmission() != null
                ? bulletin.getDateEmission()
                : java.time.LocalDate.now();
        bulletin.setDateEmission(emission);

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"ID"});
            ps.setBigDecimal(1, bulletin.getSalaireDeBase());
            ps.setDate(2, Date.valueOf(emission));
            setNullable(ps, 3, bulletin.getTotalPrime());
            setNullable(ps, 4, bulletin.getSalaireBrute());
            setNullable(ps, 5, bulletin.getBaseIrsa());
            setNullable(ps, 6, bulletin.getIrsa());
            setNullable(ps, 7, bulletin.getSalaireNet());
            setNullable(ps, 8, bulletin.getChargePatronal());
            setNullable(ps, 9, bulletin.getCoutGlobale());
            setNullable(ps, 10, bulletin.getHeurTravaille());
            setNullable(ps, 11, bulletin.getCongeRestant());
            ps.setLong(12, bulletin.getNumeroMatricule());
            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key != null) {
            return key.longValue();
        }
        // Certains pilotes Oracle ne renvoient pas la clé : on la relit.
        Long id = jdbcTemplate.queryForObject(
                "SELECT MAX(id) FROM buletin_paie WHERE numero_matricule = ? AND date_emission = ?",
                Long.class,
                bulletin.getNumeroMatricule(),
                Date.valueOf(emission));
        return id != null ? id : 0L;
    }

    private void setNullable(PreparedStatement ps, int index, BigDecimal valeur) throws SQLException {
        if (valeur == null) {
            ps.setNull(index, Types.NUMERIC);
        } else {
            ps.setBigDecimal(index, valeur);
        }
    }

    /** Un bulletin existe-t-il déjà pour cet employé sur ce mois de paie ? */
    public boolean existePour(long numeroMatricule, java.time.LocalDate dateEmission) {
        String sql = """
            SELECT COUNT(*) FROM buletin_paie
            WHERE numero_matricule = ?
              AND TRUNC(date_emission, 'MM') = TRUNC(?, 'MM')
            """;
        Integer nombre = jdbcTemplate.queryForObject(sql, Integer.class, numeroMatricule, Date.valueOf(dateEmission));
        return nombre != null && nombre > 0;
    }

    /** Nom complet de l'employé, ou null s'il n'existe pas. */
    public String nomEmploye(long numeroMatricule) {
        List<String> noms = jdbcTemplate.queryForList(
                "SELECT nom_et_prenoms FROM employe WHERE numero_matricule = ?",
                String.class,
                numeroMatricule);
        return noms.isEmpty() ? null : noms.get(0);
    }

    /** Salaire de base prévu par le poste de l'employé, avec son libellé. */
    public Map<String, Object> salaireDeBaseDuPoste(long numeroMatricule) {
        String sql = """
            SELECT p.salaire_de_base,
                   p.titre,
                   NVL(em.emploi, p.titre) AS emploi,
                   NVL(p.qualification, 'Non Cadre') AS qualification,
                   p.coefficient
            FROM employe em
            JOIN poste p ON p.id = em.poste_id
            WHERE em.numero_matricule = ?
            """;
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, numeroMatricule);
        if (rows.isEmpty()) {
            return null;
        }
        // Oracle renvoie les noms de colonnes en majuscules : on expose des clés lisibles.
        Map<String, Object> row = rows.get(0);
        Map<String, Object> poste = new java.util.LinkedHashMap<>();
        poste.put("salaireDeBase", row.get("SALAIRE_DE_BASE"));
        poste.put("titre", row.get("TITRE"));
        poste.put("emploi", row.get("EMPLOI"));
        poste.put("qualification", row.get("QUALIFICATION"));
        poste.put("coefficient", row.get("COEFFICIENT"));
        return poste;
    }

    /** Met à jour les totaux calculés d'un bulletin en une seule requête. */
    public int mettreAJourTotaux(long bulletinId,
                                 BigDecimal salaireBrute,
                                 BigDecimal baseIrsa,
                                 BigDecimal irsa,
                                 BigDecimal salaireNet,
                                 BigDecimal chargePatronal,
                                 BigDecimal coutGlobale) {
        String sql = """
            UPDATE buletin_paie
            SET salaire_brute = ?,
                base_irsa = ?,
                irsa = ?,
                salaire_net = ?,
                charge_patronal = ?,
                cout_globale = ?
            WHERE id = ?
            """;

        return jdbcTemplate.update(sql, salaireBrute, baseIrsa, irsa, salaireNet,
                chargePatronal, coutGlobale, bulletinId);
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

    public int mettreAJourBaseIrsa(long bulletinId, BigDecimal baseIrsa) {
        String sql = """
            UPDATE buletin_paie
            SET base_irsa = ?
            WHERE id = ?
            """;

        return jdbcTemplate.update(sql, baseIrsa, bulletinId);
    }

    public int mettreAJourIrsa(long bulletinId, BigDecimal irsa) {
        String sql = """
            UPDATE buletin_paie
            SET irsa = ?
            WHERE id = ?
            """;

        return jdbcTemplate.update(sql, irsa, bulletinId);
    }

    public int mettreAJourSalaireNet(long bulletinId, BigDecimal salaireNet) {
        String sql = """
            UPDATE buletin_paie
            SET salaire_net = ?
            WHERE id = ?
            """;

        return jdbcTemplate.update(sql, salaireNet, bulletinId);
    }

    public int mettreAJourChargePatronal(long bulletinId, BigDecimal chargePatronal) {
        String sql = """
            UPDATE buletin_paie
            SET charge_patronal = ?
            WHERE id = ?
            """;

        return jdbcTemplate.update(sql, chargePatronal, bulletinId);
    }

    public int mettreAJourCoutGlobale(long bulletinId, BigDecimal coutGlobale) {
        String sql = """
            UPDATE buletin_paie
            SET cout_globale = ?
            WHERE id = ?
            """;

        return jdbcTemplate.update(sql, coutGlobale, bulletinId);
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
