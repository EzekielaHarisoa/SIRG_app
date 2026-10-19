package com.project.backend.employe;

import com.project.backend.Client;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public class EmployeRepository {

    private final JdbcTemplate jdbcTemplate;

    public EmployeRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Employe> findAllEmploye() {
        String sql = "SELECT numero_matricule, nom_et_prenoms, telephone, adresse, date_embauche, entreprise_id, poste_id from employe ";
        return jdbcTemplate.query(sql,(rs, nrw) -> {
            Employe employe = new Employe();
            employe.setNumerMatricule(rs.getLong("numero_matricule"));
            employe.setNomEtPrenoms(rs.getString("nom_et_prenoms"));
            employe.setTelephone(rs.getString("telephone"));
            employe.setAdresse(rs.getString("adresse"));
            employe.setDateEmbauche(rs.getDate("date_embauche"));
            employe.setEntrepriseId(rs.getLong("entreprise_id"));
            employe.setPosteId(rs.getLong("poste_id"));

            return employe;
        });
    }

    public Employe ajoutEmploye( String nomEtPrenoms, String telephone, String adresse, Date dateEmbauche, Long entrepriseId, Long posteId) {
        String sql = "INSERT INTO employe( nom_et_prenoms, telephone, adresse, date_embauche, entreprise_id, poste_id) values (?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql, nomEtPrenoms, telephone, adresse, dateEmbauche, entrepriseId, posteId);

        return new Employe( nomEtPrenoms, telephone, adresse, dateEmbauche, entrepriseId, posteId);
    }

    public Employe getemployeById(long numeroMatricule) {
        String sql = "select numero_matricule, nom_et_prenoms, telephone, adresse, date_embauche, entreprise_id, poste_id from employe where numero_matricule = ?";
        return  jdbcTemplate.queryForObject(sql, (rs, nrw) -> {

            Employe employe = new Employe();

            employe.setNumerMatricule(rs.getLong("numero_matricule"));
            employe.setNomEtPrenoms(rs.getString("nom_et_prenoms"));
            employe.setTelephone(rs.getString("telephone"));
            employe.setAdresse(rs.getString("adresse"));
            employe.setDateEmbauche(rs.getDate("date_embauche"));
            employe.setEntrepriseId(rs.getLong("entreprise_id"));
            employe.setPosteId(rs.getLong("poste_id"));

            return employe;

        }, numeroMatricule);
    }

    public Employe modifierEmploye(long numeroMatricule, String nomEtPrenoms, String telephone, String adresse, Date dateEmbauche, Long entrepriseId, Long posteId) {
        String sql = "UPDATE employe SET  nom_et_prenoms = ?, telephone = ?,  adresse = ?,  date_embauche = ?,  entreprise_id = ?,  poste_id = ? where numero_matricule = ?";

        Employe employe = getemployeById(numeroMatricule);

        int ligneModifier = jdbcTemplate.update(sql,
                nomEtPrenoms,
                telephone,
                adresse,
                dateEmbauche,
                entrepriseId,
                posteId ,
                numeroMatricule);

        if(ligneModifier ==0 ) {
            return null;
        }

        return employe;
    }


}
