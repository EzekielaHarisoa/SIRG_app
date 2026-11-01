package com.project.backend.conge.soldeConge;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public class SoldeCongeRepository {

    private final JdbcTemplate jdbcTemplate;

    public SoldeCongeRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<SoldeConge> findByNumeroMatricule(long numeroMatricule) {

        String sql = """
            SELECT
                e.numero_matricule,

                NVL(
                    SUM(
                        CASE
                            WHEN t.statut = 'ACTIVE'
                             AND TRUNC(SYSDATE) < t.date_expiration
                            THEN t.jours_acquis
                            ELSE 0
                        END
                    ), 0
                ) AS jours_acquis,

                NVL(
                    SUM(
                        CASE
                            WHEN t.statut = 'ACTIVE'
                             AND TRUNC(SYSDATE) < t.date_expiration
                            THEN NVL(c.jours_pris, 0)
                            ELSE 0
                        END
                    ), 0
                ) AS jours_pris,

                NVL(
                    SUM(
                        CASE
                            WHEN t.statut = 'ACTIVE'
                             AND TRUNC(SYSDATE) < t.date_expiration
                            THEN GREATEST(
                                t.jours_acquis - NVL(c.jours_pris, 0),
                                0
                            )
                            ELSE 0
                        END
                    ), 0
                ) AS solde_restant

            FROM employe e

            LEFT JOIN tranche_conge t
                ON t.numero_matricule = e.numero_matricule

            LEFT JOIN (
                SELECT
                    tranche_id,
                    SUM(jours_consommes) AS jours_pris
                FROM consommation_conge
                GROUP BY tranche_id
            ) c
                ON c.tranche_id = t.id

            WHERE e.numero_matricule = ?

            GROUP BY e.numero_matricule
            """;

        List<SoldeConge> resultats = jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {

                    SoldeConge solde = new SoldeConge();

                    solde.setNumeroMatricule(
                            rs.getLong("numero_matricule")
                    );

                    solde.setSoldeInitial(BigDecimal.ZERO);

                    solde.setJoursAcquis(
                            rs.getBigDecimal("jours_acquis")
                    );

                    solde.setJoursPris(
                            rs.getBigDecimal("jours_pris")
                    );

                    solde.setSoldeRestant(
                            rs.getBigDecimal("solde_restant")
                    );

                    return solde;
                },
                numeroMatricule
        );

        return resultats.stream().findFirst();
    }
}