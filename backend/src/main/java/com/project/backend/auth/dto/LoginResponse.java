
package com.project.backend.auth.dto;

public class LoginResponse {

    private Long id;
    private String login;
    private Long numeroMatricule;
    private String nomEtPrenoms;
    private String role;

    public LoginResponse() {
    }

    public LoginResponse(
            Long id,
            String login,
            Long numeroMatricule,
            String nomEtPrenoms,
            String role
    ) {
        this.id = id;
        this.login = login;
        this.numeroMatricule = numeroMatricule;
        this.nomEtPrenoms = nomEtPrenoms;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public Long getNumeroMatricule() {
        return numeroMatricule;
    }

    public void setNumeroMatricule(Long numeroMatricule) {
        this.numeroMatricule = numeroMatricule;
    }

    public String getNomEtPrenoms() {
        return nomEtPrenoms;
    }

    public void setNomEtPrenoms(String nomEtPrenoms) {
        this.nomEtPrenoms = nomEtPrenoms;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
