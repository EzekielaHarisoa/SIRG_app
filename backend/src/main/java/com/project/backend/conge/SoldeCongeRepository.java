package com.project.backend.conge;

import org.springframework.jdbc.core.JdbcTemplate;

import java.sql.SQLException;
import java.time.chrono.JapaneseDate;

public class SoldeCongeRepository {
    private final JdbcTemplate jdbcTemplate;

    public SoldeCongeRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public SoldeConge mapSoldeConge(java.sql.ResultSet rs, int nrw) throws SQLException {
        SoldeConge soldeConge = new SoldeConge();

        soldeConge.setId(rs.getLong("id"));
        soldeConge.setNumeroMatricule(rs.getLong("numero_matricule"));
        soldeConge.setAnnee(rs.getInt("anne"));
        soldeConge.setSoldeInitial(rs.getBigDecimal("solde_initial"));
        soldeConge.setJoursAcquis(rs.getBigDecimal("jours_acquis"));
        soldeConge.setJoursPris(rs.getBigDecimal("jours_pris"));
        soldeConge.setSoldeRestant(rs.getBigDecimal("solde_restant"));

        return soldeConge;

    }

    public SoldeConge getSoldeByNumeroMatricule(long numeroMatricule) {
        String sql = """
                SELECT  
                        id,
                        numero_matricule,
                        anne,
                        solde_initial,
                        jours_aquis, 
                        jours_pris,  
                        solde_restant
                FROM    solde_conge
                WHERE   numero_matricule = ?
               """;

        return jdbcTemplate.queryForObject(sql, this::mapSoldeConge, numeroMatricule);
    }

    public int calculeSoldeConge(SoldeConge soldeConge) {
        String sql = """
                INSERT INTO solde_conge( 
                        anne,
                        solde_initial,
                        jours_aquis, 
                        jours_pris,  
                        solde_restant
                        ) 
                VALUES (?, ?, ?, ?, ?)        
                """;

        return jdbcTemplate.update(
                sql,
                soldeConge.getAnnee(),
                soldeConge.getSoldeInitial(),
                soldeConge.getJoursAcquis(),
                soldeConge.getJoursPris(),
                soldeConge.getSoldeRestant()
        );
    }
}
