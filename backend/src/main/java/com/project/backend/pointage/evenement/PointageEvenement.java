
package com.project.backend.pointage.evenement;

import java.time.LocalDateTime;

public class PointageEvenement {

    private Long id;
    private Long pointageId;
    private TypeEvenement typeEvenement;
    private LocalDateTime dateHeure;
    private String modePointage;

    public PointageEvenement() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPointageId() {
        return pointageId;
    }

    public void setPointageId(Long pointageId) {
        this.pointageId = pointageId;
    }

    public TypeEvenement getTypeEvenement() {
        return typeEvenement;
    }

    public void setTypeEvenement(TypeEvenement typeEvenement) {
        this.typeEvenement = typeEvenement;
    }

    public LocalDateTime getDateHeure() {
        return dateHeure;
    }

    public void setDateHeure(LocalDateTime dateHeure) {
        this.dateHeure = dateHeure;
    }

    public String getModePointage() {
        return modePointage;
    }

    public void setModePointage(String modePointage) {
        this.modePointage = modePointage;
    }
}
