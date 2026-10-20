package com.project.backend.conge;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.SQLException;
import java.util.List;

@Repository
public class DemandeCongeRepository {

    private final JdbcTemplate jdbcTemplate;

    public DemandeCongeRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private DemandeConge mapDemandeConge(java.sql.ResultSet rs, int nrw) throws SQLException {
        DemandeConge demandeConge = new DemandeConge();

        demandeConge.setId(rs.getLong("id"));
        demandeConge.setMotif(rs.getString("motif"));
        demandeConge.setStatus(rs.getString("status"));
        demandeConge.setTypeConge(rs.getString("type_conge"));

        Date dateDemande = rs.getDate("date_de_demande");
        if(dateDemande != null ) {
            demandeConge.setDateDeDemande(dateDemande.toLocalDate());
        }

        Date dateDebut = rs.getDate("date_de_debut");
        if(dateDebut != null) {
            demandeConge.setDateDeDebut(dateDebut.toLocalDate());
        }

        Date dateFin = rs.getDate("date_fin");
        if(dateFin != null ) {
            demandeConge.setDateFin(dateFin.toLocalDate());
        }

        demandeConge.setMotifRefus(rs.getString("motif_refus"));
        demandeConge.setNumeroMatricule(rs.getLong("numero_matricule"));

        return demandeConge;
    }

    public List<DemandeConge> findAllDemandeConge() {
        String sql = """
            SELECT id, motif, status, type_conge,
                   date_de_demande, date_de_debut, date_fin,
                   motif_refus, numero_matricule
            FROM demande_conges
            ORDER BY date_de_demande DESC
            """;
        return  jdbcTemplate.query(sql,  this::mapDemandeConge);

    }

    public List<DemandeConge> findById(long id) {
        String sql = """
            SELECT id, motif, status, type_conge,
                   date_de_demande, date_de_debut, date_fin,
                   motif_refus, numero_matricule
            FROM demande_conges 
            WHERE id = ?
            ORDER BY date_de_demande DESC
            """;
        return  jdbcTemplate.query(sql,this::mapDemandeConge, id);
    }

    public List<DemandeConge> findByNumeroMatricule(long numeroMatricule) {
        String sql = """
            SELECT id, motif, status, type_conge,
                   date_de_demande, date_de_debut, date_fin,
                   motif_refus, numero_matricule
            FROM demande_conges 
            WHERE numero_matricule = ?
            ORDER BY date_de_demande DESC
            """;
        return  jdbcTemplate.query(sql,this::mapDemandeConge, numeroMatricule);
    }

    public int save(DemandeConge demandeConge) {
        String sql = """
            INSERT INTO demande_conges(
                motif,
                type_conge,
                date_de_debut,
                date_fin,
                numero_matricule ) 
            VALUES (?, ?, ?, ?, ?)  
            """;

        return jdbcTemplate.update(sql,
                demandeConge.getMotif(),
                demandeConge.getTypeConge(),
                Date.valueOf(demandeConge.getDateDeDebut()),
                Date.valueOf(demandeConge.getDateFin()),
                demandeConge.getNumeroMatricule()
                );
    }

}
