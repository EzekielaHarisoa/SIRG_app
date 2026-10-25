
package com.project.backend.conge;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class DemandeConge {

    private Long id;

    @Size(max = 255, message = "Le motif ne doit pas dépasser 255 caractères.")
    private String motif;

    @Pattern(
            regexp = "ACCEPTER|REFUSER|EN_ATTENTE",
            message = "Le statut doit être ACCEPTER, REFUSER ou EN_ATTENTE."
    )
    private String status;

    @NotBlank(message = "Le type de congé est obligatoire.")
    @Pattern(
            regexp = "MATERNITE|PATERNITE|PERMISSION|MALADIE|CONGE_PAYE",
            message = "Le type de congé n'est pas valide."
    )
    private String typeConge;

    private LocalDate dateDeDemande;

    @NotNull(message = "La date de début est obligatoire.")
    private LocalDate dateDeDebut;

    @NotNull(message = "La date de fin est obligatoire.")
    private LocalDate dateFin;

    @Size(max = 255, message = "Le motif du refus ne doit pas dépasser 255 caractères.")
    private String motifRefus;

    @NotNull(message = "Le numéro matricule est obligatoire.")
    @Positive(message = "Le numéro matricule doit être positif.")
    private Long numeroMatricule;

    public DemandeConge() {
    }

    public DemandeConge(
            Long id,
            String motif,
            String status,
            String typeConge,
            LocalDate dateDeDemande,
            LocalDate dateDeDebut,
            LocalDate dateFin,
            String motifRefus,
            Long numeroMatricule
    ) {
        this.id = id;
        this.motif = motif;
        this.status = status;
        this.typeConge = typeConge;
        this.dateDeDemande = dateDeDemande;
        this.dateDeDebut = dateDeDebut;
        this.dateFin = dateFin;
        this.motifRefus = motifRefus;
        this.numeroMatricule = numeroMatricule;
    }

    @JsonIgnore
    @AssertTrue(message = "La date de fin doit être égale ou postérieure à la date de début.")
    public boolean isPeriodeValide() {
        if (dateDeDebut == null || dateFin == null) {
            return true;
        }

        return !dateFin.isBefore(dateDeDebut);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMotif() {
        return motif;
    }

    public void setMotif(String motif) {
        this.motif = motif;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTypeConge() {
        return typeConge;
    }

    public void setTypeConge(String typeConge) {
        this.typeConge = typeConge;
    }

    public LocalDate getDateDeDemande() {
        return dateDeDemande;
    }

    public void setDateDeDemande(LocalDate dateDeDemande) {
        this.dateDeDemande = dateDeDemande;
    }

    public LocalDate getDateDeDebut() {
        return dateDeDebut;
    }

    public void setDateDeDebut(LocalDate dateDeDebut) {
        this.dateDeDebut = dateDeDebut;
    }

    public LocalDate getDateFin() {
        return dateFin;
    }

    public void setDateFin(LocalDate dateFin) {
        this.dateFin = dateFin;
    }

    public String getMotifRefus() {
        return motifRefus;
    }

    public void setMotifRefus(String motifRefus) {
        this.motifRefus = motifRefus;
    }

    public Long getNumeroMatricule() {
        return numeroMatricule;
    }

    public void setNumeroMatricule(Long numeroMatricule) {
        this.numeroMatricule = numeroMatricule;
    }
}
