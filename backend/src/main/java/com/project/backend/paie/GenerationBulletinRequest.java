package com.project.backend.paie;

import java.math.BigDecimal;

/**
 * Données saisies par le responsable RH pour générer le bulletin de paie d'un employé.
 *
 * <p>La période est désignée par un mois et une année : la date d'émission du bulletin
 * est positionnée au dernier jour de ce mois, ce qui alimente la période affichée
 * sur la fiche de paie.</p>
 */
public class GenerationBulletinRequest {

    private Long numeroMatricule;

    /** Mois de paie, de 1 (janvier) à 12 (décembre). */
    private Integer mois;

    /** Année de paie, par exemple 2026. */
    private Integer annee;

    private BigDecimal salaireDeBase;

    /** Montant brut des heures supplémentaires (en euros). */
    private BigDecimal heuresSupplementaires;

    /** Total des primes et indemnités de la période (en euros). */
    private BigDecimal totalPrime;

    private BigDecimal congeRestant;

    public Long getNumeroMatricule() {
        return numeroMatricule;
    }

    public void setNumeroMatricule(Long numeroMatricule) {
        this.numeroMatricule = numeroMatricule;
    }

    public Integer getMois() {
        return mois;
    }

    public void setMois(Integer mois) {
        this.mois = mois;
    }

    public Integer getAnnee() {
        return annee;
    }

    public void setAnnee(Integer annee) {
        this.annee = annee;
    }

    public BigDecimal getSalaireDeBase() {
        return salaireDeBase;
    }

    public void setSalaireDeBase(BigDecimal salaireDeBase) {
        this.salaireDeBase = salaireDeBase;
    }

    public BigDecimal getHeuresSupplementaires() {
        return heuresSupplementaires;
    }

    public void setHeuresSupplementaires(BigDecimal heuresSupplementaires) {
        this.heuresSupplementaires = heuresSupplementaires;
    }

    public BigDecimal getTotalPrime() {
        return totalPrime;
    }

    public void setTotalPrime(BigDecimal totalPrime) {
        this.totalPrime = totalPrime;
    }

    public BigDecimal getCongeRestant() {
        return congeRestant;
    }

    public void setCongeRestant(BigDecimal congeRestant) {
        this.congeRestant = congeRestant;
    }
}
