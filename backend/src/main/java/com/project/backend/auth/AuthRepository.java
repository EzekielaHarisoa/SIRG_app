
package com.project.backend.auth;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class AuthRepository {

    private final JdbcTemplate jdbcTemplate;

    public AuthRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Map<String, Object> trouverParLogin(String login) {

        String sql = """
                SELECT
                    u.id,
                    u.login,
                    u.mot_de_pass,
                    u.actif,
                    u.numero_matricule,
                    e.nom_et_prenoms,
                    r.libelle AS role
                FROM utilisateur u
                JOIN employe e
                    ON e.numero_matricule = u.numero_matricule
                JOIN role r
                    ON r.id = u.role_id
                WHERE u.login = ?
                """;

        List<Map<String, Object>> resultats =
                jdbcTemplate.queryForList(sql, login);

        if (resultats.isEmpty()) {
            return null;
        }

        return resultats.get(0);
    }
}
