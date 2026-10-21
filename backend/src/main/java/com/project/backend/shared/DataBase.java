package com.project.backend.shared;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;

public class DataBase implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DataBase(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String ...args) {
        Integer resultat = jdbcTemplate.queryForObject("SELECT 1 FROM DUAL", Integer.class);
        System.out.println("Connexion Oracle réussie !");
        System.out.println("Résultat du test : " + resultat);
    }
}
