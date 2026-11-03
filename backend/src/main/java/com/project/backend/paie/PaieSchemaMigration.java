package com.project.backend.paie;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class PaieSchemaMigration implements CommandLineRunner {

    private final JdbcTemplate jdbc;

    public PaieSchemaMigration(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(String... args) {
        try {
            addColumnsIfMissing();
            createTablesIfMissing();
            System.out.println("[PaieSchemaMigration] Schéma paie mis à jour.");
        } catch (Exception e) {
            System.out.println("[PaieSchemaMigration] Évolution du schéma paie non appliquée : " + e.getMessage());
        }
    }

    private void addColumnsIfMissing() {
        // ENTREPRISE
        addColumnIfMissing("ENTREPRISE", "SIRET", "VARCHAR2(14)");
        addColumnIfMissing("ENTREPRISE", "CODE_NAF", "VARCHAR2(10)");
        addColumnIfMissing("ENTREPRISE", "MATRICULE_URSSAF", "VARCHAR2(20)");
        addColumnIfMissing("ENTREPRISE", "CONVENTION", "VARCHAR2(100)");
        addColumnIfMissing("ENTREPRISE", "ADRESSE_COMPLETE", "VARCHAR2(200)");

        // POSTE
        addColumnIfMissing("POSTE", "QUALIFICATION", "VARCHAR2(30)");
        addColumnIfMissing("POSTE", "COEFFICIENT", "NUMBER");

        // EMPLOYE
        addColumnIfMissing("EMPLOYE", "NUMERO_SECURITE_SOCIALE", "VARCHAR2(15)");
        addColumnIfMissing("EMPLOYE", "ENTREE_LE", "DATE");
        addColumnIfMissing("EMPLOYE", "EMPLOI", "VARCHAR2(100)");
        addColumnIfMissing("EMPLOYE", "TYPE_CONTRAT", "VARCHAR2(20)");
    }

    private void createTablesIfMissing() {
        createTableIfMissing(
            "COTISATION_REGLEMENT",
            """
            (ID NUMBER PRIMARY KEY,
             FAMILLE VARCHAR2(60) NOT NULL,
             CODE VARCHAR2(20) NOT NULL,
             LIBELLE VARCHAR2(150) NOT NULL,
             EST_SALARIAL CHAR(1) NOT NULL,
             TAUX_SALARIAL NUMBER,
             TAUX_PATRONAL NUMBER,
             TYPE_BASE VARCHAR2(20) NOT NULL)
            """);

        createTableIfMissing(
            "LIGNE_COTISATION",
            """
            (ID NUMBER PRIMARY KEY,
             BULLETIN_PAIE_ID NUMBER NOT NULL,
             COTISATION_REGLEMENT_ID NUMBER NOT NULL,
             BASE NUMBER,
             COTISATION_SALARIALE NUMBER,
             COTISATION_PATRONALE NUMBER,
             CONSTRAINT FK_LC_BULLETIN FOREIGN KEY (BULLETIN_PAIE_ID) REFERENCES BULETIN_PAIE(ID),
             CONSTRAINT FK_LC_COTISATION FOREIGN KEY (COTISATION_REGLEMENT_ID) REFERENCES COTISATION_REGLEMENT(ID))
            """);

        createSequenceIfMissing("SEQ_COTISATION_REGLEMENT");
        createSequenceIfMissing("SEQ_LIGNE_COTISATION");

        // Ordre d'affichage des rubriques sur la fiche de paie
        addColumnIfMissing("COTISATION_REGLEMENT", "ORDRE", "NUMBER");
    }

    private void addColumnIfMissing(String table, String column, String type) {
        try {
            jdbc.execute("ALTER TABLE " + table + " ADD " + column + " " + type);
        } catch (Exception e) {
            // colonne existe déjà ou autre → on ignore
        }
    }

    private void createTableIfMissing(String table, String ddl) {
        try {
            jdbc.execute("CREATE TABLE " + table + " " + ddl);
        } catch (Exception e) {
            // table existe déjà → on ignore
        }
    }

    private void createSequenceIfMissing(String sequenceName) {
        try {
            jdbc.execute("CREATE SEQUENCE " + sequenceName);
        } catch (Exception e) {
            // séquence existe déjà → on ignore
        }
    }
}
