package com.project.backend.paie;

import java.time.LocalDate;

public class PeriodePaie {

    private LocalDate debut;
    private LocalDate fin;
    private LocalDate paiementLe;

    public LocalDate getDebut() {
        return debut;
    }

    public void setDebut(LocalDate debut) {
        this.debut = debut;
    }

    public LocalDate getFin() {
        return fin;
    }

    public void setFin(LocalDate fin) {
        this.fin = fin;
    }

    public LocalDate getPaiementLe() {
        return paiementLe;
    }

    public void setPaiementLe(LocalDate paiementLe) {
        this.paiementLe = paiementLe;
    }
}
