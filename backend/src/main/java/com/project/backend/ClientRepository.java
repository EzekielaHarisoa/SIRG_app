package com.project.backend;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public class ClientRepository {

    private final JdbcTemplate jdbcTemplate;

    public ClientRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public  List<Client> findAll() {
        String sql = "SELECT ID, NOM, TELEPHONE FROM CLIENTS";
        return jdbcTemplate.query(sql, (rw, rwNum) -> {
            Client client = new Client();

            client.setId(rw.getLong("id"));
            client.setNom(rw.getString("nom"));
            client.setTelephone(rw.getString("telephone"));

            return client;
        });
    }

    public Client ajoutClient(long id, String nom, String telephone) {
        String sql = "INSERT INTO CLIENTS(ID, NOM, TELEPHONE) VALUES (?, ?, ?)";
        jdbcTemplate.update(sql, id, nom, telephone);

        return new Client(id, nom, telephone);
    }


    public Client getClientById(long id) {
        String sql = "SELECT * FROM CLIENTS WHERE ID = ?";

        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
            Client client = new Client();

            client.setId(rs.getLong("ID"));
            client.setNom(rs.getString("NOM"));
            client.setTelephone(rs.getString("TELEPHONE"));

            return client;
        }, id);
    }


    public Client modifierClient(long id, String nom, String telephone) {
        String sql = "UPDATE CLIENTS SET  NOM = ? , TELEPHONE = ? WHERE ID = ?";

        Client client = getClientById(id);

        jdbcTemplate.update(sql, nom, telephone, id);
        client.setNom(nom);
        client.setTelephone(telephone);

        return client;
    }

    public void deleteClient(long id) {
        getClientById(id);
        String sql = "DELETE FROM CLIENTS WHERE ID = ?";
        jdbcTemplate.update(sql, id);
    }
}
