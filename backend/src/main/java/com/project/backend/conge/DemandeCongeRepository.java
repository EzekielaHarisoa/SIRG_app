
package com.project.backend.conge;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public class DemandeCongeRepository {

    private final JdbcTemplate jdbcTemplate;

    public DemandeCongeRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }


    private DemandeConge mapDemandeConge(java.sql.ResultSet rs, int rowNum) throws SQLException {

        DemandeConge demandeConge = new DemandeConge();

        demandeConge.setId(rs.getLong("id"));
        demandeConge.setMotif(rs.getString("motif"));
        demandeConge.setStatus(rs.getString("status"));
        demandeConge.setTypeConge(rs.getString("type_conge"));

        // Date de création de la demande
        Date dateDemande = rs.getDate("date_de_demande");

        if (dateDemande != null) {
            demandeConge.setDateDeDemande(
                    dateDemande.toLocalDate()
            );
        }

        // Date de début
        Date dateDebut = rs.getDate("date_de_debut");

        if (dateDebut != null) {
            demandeConge.setDateDeDebut(
                    dateDebut.toLocalDate()
            );
        }

        // Date de fin
        Date dateFin = rs.getDate("date_fin");

        if (dateFin != null) {
            demandeConge.setDateFin(
                    dateFin.toLocalDate()
            );
        }

        demandeConge.setMotifRefus(
                rs.getString("motif_refus")
        );

        demandeConge.setNumeroMatricule(
                rs.getLong("numero_matricule")
        );

        return demandeConge;
    }

    public List<DemandeConge> findAllDemandeConge() {

        String sql = """
                SELECT
                    id,
                    motif,
                    status,
                    type_conge,
                    date_de_demande,
                    date_de_debut,
                    date_fin,
                    motif_refus,
                    numero_matricule
                FROM demande_conges
                ORDER BY date_de_demande DESC
                """;

        return jdbcTemplate.query(
                sql,
                this::mapDemandeConge
        );
    }

    public Optional<DemandeConge> findById(long id) {

        String sql = """
                SELECT
                    id,
                    motif,
                    status,
                    type_conge,
                    date_de_demande,
                    date_de_debut,
                    date_fin,
                    motif_refus,
                    numero_matricule
                FROM demande_conges
                WHERE id = ?
                """;

        List<DemandeConge> resultat = jdbcTemplate.query(
                sql,
                this::mapDemandeConge,
                id
        );

        return resultat.stream().findFirst();
    }

    public List<DemandeConge> findByNumeroMatricule(long numeroMatricule) {

        String sql = """
                SELECT
                    id,
                    motif,
                    status,
                    type_conge,
                    date_de_demande,
                    date_de_debut,
                    date_fin,
                    motif_refus,
                    numero_matricule
                FROM demande_conges
                WHERE numero_matricule = ?
                ORDER BY date_de_demande DESC
                """;

        return jdbcTemplate.query(
                sql,
                this::mapDemandeConge,
                numeroMatricule
        );
    }

    public int save(DemandeConge demandeConge) {

        String sql = """
                INSERT INTO demande_conges (
                    motif,
                    type_conge,
                    date_de_debut,
                    date_fin,
                    numero_matricule
                )
                VALUES (?, ?, ?, ?, ?)
                """;

        return jdbcTemplate.update(
                sql,
                demandeConge.getMotif(),
                demandeConge.getTypeConge(),
                Date.valueOf(demandeConge.getDateDeDebut()),
                Date.valueOf(demandeConge.getDateFin()),
                demandeConge.getNumeroMatricule()
        );
    }

    public boolean existsChevauchement(long numeroMatricule, java.time.LocalDate dateDebut, java.time.LocalDate dateFin) {

        String sql = """
            SELECT COUNT(*)
            FROM demande_conges
            WHERE numero_matricule = ?
              AND status <> 'REFUSER'
              AND date_de_debut <= ?
              AND date_fin >= ?
            """;

        Integer nombre = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                numeroMatricule,
                Date.valueOf(dateFin),
                Date.valueOf(dateDebut)
        );

        return nombre != null && nombre > 0;
    }

    public int refuserDemande(long id, String motifRefus) {

        String sql = """
            UPDATE demande_conges
            SET status = 'REFUSER',
                motif_refus = ?
            WHERE id = ?
              AND status = 'EN_ATTENTE'
            """;

        return jdbcTemplate.update(
                sql,
                motifRefus,
                id
        );
    }

    public long enregistrerPeriode(
            long demandeId,
            LocalDate dateDebut,
            LocalDate dateFin,
            String naturePeriode,
            double nombreJours
    ) {
        String sql = """
            INSERT INTO periode_demande_conge (
                demande_id,
                date_debut,
                date_fin,
                nature_periode,
                nombre_jours
            )
            VALUES (?, ?, ?, ?, ?)
            """;

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    sql,
                    new String[]{"ID"}
            );

            ps.setLong(1, demandeId);
            ps.setDate(2, Date.valueOf(dateDebut));
            ps.setDate(3, Date.valueOf(dateFin));
            ps.setString(4, naturePeriode);
            ps.setDouble(5, nombreJours);

            return ps;
        }, keyHolder);

        if (keyHolder.getKey() == null) {
            throw new IllegalStateException(
                    "Impossible de récupérer l'identifiant de la période."
            );
        }

        return keyHolder.getKey().longValue();
    }

    public int accepterDemande(long id) {
        String sql = """
            UPDATE demande_conges
            SET status = 'ACCEPTER'
            WHERE id = ?
              AND status = 'EN_ATTENTE'
            """;

        return jdbcTemplate.update(sql, id);
    }
}
