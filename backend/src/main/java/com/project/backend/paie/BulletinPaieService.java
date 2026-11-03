
package com.project.backend.paie;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class BulletinPaieService {

    private final BulletinPaieRepository bulletinPaieRepository;
    private final FichePaieService fichePaieService;

    public BulletinPaieService(BulletinPaieRepository bulletinPaieRepository,
                               FichePaieService fichePaieService) {
        this.bulletinPaieRepository = bulletinPaieRepository;
        this.fichePaieService = fichePaieService;
    }

    public List<BulletinPaie> findAll() {
        return bulletinPaieRepository.findAll();
    }

    public BulletinPaie findById(long id) {
        if (id <= 0) {
            throw new IllegalArgumentException("L'identifiant doit être supérieur à zéro");
        }
        BulletinPaie bulletin = bulletinPaieRepository.findById(id);

        if (bulletin == null) {
            throw new BulletinPaieNotFoundException(id);
        }
        return bulletinPaieRepository.findById(id);
    }

    public List<BulletinPaie> findByNumeroMatricule(
            long numeroMatricule
    ) {
        return bulletinPaieRepository.findByNumeroMatricule(
                numeroMatricule
        );
    }

    @Transactional
    public int update(BulletinPaie bulletin) {
        if (bulletin == null || bulletin.getId() == null || bulletin.getId() <= 0) {
            throw new IllegalArgumentException("L'identifiant du bulletin est invalide");
        }

        BulletinPaie existing = bulletinPaieRepository.findById(bulletin.getId());
        if (existing == null) {
            throw new BulletinPaieNotFoundException(bulletin.getId());
        }

        if (bulletin.getNumeroMatricule() == null || bulletin.getNumeroMatricule() <= 0) {
            throw new IllegalArgumentException("Le numéro matricule doit être supérieur à zéro");
        }

        if (bulletin.getSalaireDeBase() == null || bulletin.getSalaireDeBase().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Le salaire de base doit être supérieur à zéro");
        }

        return bulletinPaieRepository.update(bulletin.getId(), bulletin);
    }

    public long save(BulletinPaie bulletin) {
        if(bulletin == null) {
            throw new IllegalArgumentException("Les données du bulletin sont obligatoires");
        }

        if(bulletin.getSalaireDeBase() == null || bulletin.getSalaireDeBase().compareTo(BigDecimal.ZERO) <= 0) {
            throw  new IllegalArgumentException("Le salaire de base doit etre superieur a 0");
        }

        if (bulletin.getNumeroMatricule() == null || bulletin.getNumeroMatricule() <= 0) {
            throw new IllegalArgumentException("Le numéro matricule doit être supérieur à zéro");
        }

        return bulletinPaieRepository.save(bulletin);
    }

    /**
     * Génère le bulletin de paie d'un employé pour un mois donné.
     *
     * <p>Le salaire brut est composé du salaire de base, des heures supplémentaires et
     * des primes. Les cotisations, le net et le coût employeur sont ensuite repris de la
     * fiche de paie afin que le bulletin et sa fiche restent cohérents.</p>
     */
    @Transactional
    public BulletinPaie generer(GenerationBulletinRequest demande) {
        if (demande == null) {
            throw new IllegalArgumentException("Les données du bulletin sont obligatoires");
        }
        if (demande.getNumeroMatricule() == null || demande.getNumeroMatricule() <= 0) {
            throw new IllegalArgumentException("L'employé est obligatoire");
        }
        String nomEmploye = bulletinPaieRepository.nomEmploye(demande.getNumeroMatricule());
        if (nomEmploye == null) {
            throw new IllegalArgumentException(
                    "Aucun employé ne porte le matricule " + demande.getNumeroMatricule());
        }
        if (demande.getMois() == null || demande.getMois() < 1 || demande.getMois() > 12) {
            throw new IllegalArgumentException("Le mois de paie doit être compris entre 1 et 12");
        }
        if (demande.getAnnee() == null || demande.getAnnee() < 2000 || demande.getAnnee() > 2100) {
            throw new IllegalArgumentException("L'année de paie est invalide");
        }
        if (demande.getSalaireDeBase() == null
                || demande.getSalaireDeBase().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Le salaire de base doit être supérieur à zéro");
        }

        BigDecimal heuresSupplementaires = positif(demande.getHeuresSupplementaires());
        BigDecimal totalPrime = positif(demande.getTotalPrime());
        BigDecimal congeRestant = positif(demande.getCongeRestant());

        // Le bulletin est émis le dernier jour du mois de paie.
        YearMonth periode = YearMonth.of(demande.getAnnee(), demande.getMois());
        LocalDate dateEmission = periode.atEndOfMonth();

        if (bulletinPaieRepository.existePour(demande.getNumeroMatricule(), dateEmission)) {
            throw new IllegalArgumentException(
                    "Un bulletin existe déjà pour " + nomEmploye + " en "
                            + periode.getMonthValue() + "/" + periode.getYear());
        }

        BigDecimal salaireBrut = demande.getSalaireDeBase()
                .add(heuresSupplementaires)
                .add(totalPrime);

        BulletinPaie bulletin = new BulletinPaie();
        bulletin.setNumeroMatricule(demande.getNumeroMatricule());
        bulletin.setSalaireDeBase(demande.getSalaireDeBase());
        bulletin.setDateEmission(dateEmission);
        bulletin.setTotalPrime(totalPrime);
        bulletin.setHeurTravaille(heuresSupplementaires);
        bulletin.setCongeRestant(congeRestant);
        bulletin.setSalaireBrute(salaireBrut);

        long id = bulletinPaieRepository.save(bulletin);
        if (id <= 0) {
            throw new IllegalStateException("La création du bulletin a échoué");
        }

        synchroniserTotaux(id);

        return bulletinPaieRepository.findById(id);
    }

    /**
     * Recopie sur le bulletin les totaux calculés depuis le référentiel de cotisations.
     * La fiche de paie reste la référence : aucune formule n'est dupliquée ici.
     */
    private void synchroniserTotaux(long bulletinId) {
        FichePaie fiche = fichePaieService.generer(bulletinId);
        BigDecimal salaireBrut = fiche.getSalaireBrut() != null ? fiche.getSalaireBrut() : BigDecimal.ZERO;
        BigDecimal salaireNet = fiche.getSalaireNet() != null ? fiche.getSalaireNet() : BigDecimal.ZERO;
        BigDecimal patronales = fiche.getChargePatronale() != null ? fiche.getChargePatronale() : BigDecimal.ZERO;
        BigDecimal coutGlobal = fiche.getCoutGlobal() != null ? fiche.getCoutGlobal() : salaireBrut.add(patronales);

        bulletinPaieRepository.mettreAJourTotaux(
                bulletinId,
                salaireBrut,
                salaireNet,      // base IRSA : brut moins cotisations salariales
                BigDecimal.ZERO, // pas d'IRSA dans le référentiel de cotisations
                salaireNet,
                patronales,
                coutGlobal);
    }

    private BigDecimal positif(BigDecimal montant) {
        if (montant == null || montant.compareTo(BigDecimal.ZERO) < 0) {
            return BigDecimal.ZERO;
        }
        return montant;
    }

    /** Salaire de base du poste de l'employé (préremplissage du formulaire). */
    public java.util.Map<String, Object> salaireDuPoste(long numeroMatricule) {
        if (numeroMatricule <= 0) {
            throw new IllegalArgumentException("Le numéro matricule doit être supérieur à zéro");
        }
        return bulletinPaieRepository.salaireDeBaseDuPoste(numeroMatricule);
    }

    public BigDecimal calculerTotalPrime(long bulletinId) {
        return bulletinPaieRepository.calculerTotalPrime(bulletinId);
    }

    @Transactional
    public BigDecimal recalculerTotalPrime(long bulletinId) {
        BulletinPaie bulletin = bulletinPaieRepository.findById(bulletinId);

        if (bulletin == null) {
            throw new BulletinPaieNotFoundException(bulletinId);
        }

        BigDecimal totalPrime = calculerTotalPrime(bulletinId);

        bulletinPaieRepository.mettreAJourTotalPrime(bulletinId, totalPrime);

        return totalPrime;
    }

    public BigDecimal calculerSalaireBrut(long bulletinId) {
        BulletinPaie bulletin = bulletinPaieRepository.findById(bulletinId);

        if (bulletin == null) {
            throw new BulletinPaieNotFoundException(bulletinId);
        }

        BigDecimal salaireDeBase = bulletin.getSalaireDeBase();
        if (salaireDeBase == null) {
            throw new IllegalArgumentException("Le salaire de base est obligatoire");
        }

        BigDecimal totalPrime = calculerTotalPrime(bulletinId);

        BigDecimal heuresTravaille = bulletin.getHeurTravaille() != null ? bulletin.getHeurTravaille() : BigDecimal.ZERO;
        BigDecimal primes = bulletin.getTotalPrime() != null ? bulletin.getTotalPrime() : BigDecimal.ZERO;

        return salaireDeBase.add(heuresTravaille).add(primes);
    }

    @Transactional
    public BigDecimal recalculerSalaireBrut(long bulletinId) {
        BulletinPaie bulletin = bulletinPaieRepository.findById(bulletinId);
        if (bulletin == null) {
            throw new BulletinPaieNotFoundException(bulletinId);
        }

        BigDecimal salaireDeBase = bulletin.getSalaireDeBase();
        if (salaireDeBase == null) {
            throw new IllegalArgumentException("Le salaire de base est obligatoire");
        }

        if (salaireDeBase.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Le salaire de base doit être supérieur à zéro");
        }

        BigDecimal totalPrime = recalculerTotalPrime(bulletinId);

        BigDecimal heuresTravaille = bulletin.getHeurTravaille() != null ? bulletin.getHeurTravaille() : BigDecimal.ZERO;
        BigDecimal salaireBrut = salaireDeBase.add(heuresTravaille).add(totalPrime);

        int lignesModifiees = bulletinPaieRepository.mettreAJourSalaireBrut(bulletinId, salaireBrut);
        if (lignesModifiees != 1) {
            throw new IllegalStateException("Impossible de mettre à jour le salaire brut du bulletin : " + bulletinId);
        }

        return salaireBrut;
    }

    /**
     * Calcule toutes les valeurs de paie d'un bulletin, dans l'ordre défini par les règles de GRH :
     * taux horaire → heures sup → brut → charges salariales → base IRSA → IRSA → net → charges patronales → coût global
     */
    @Transactional
    public BulletinPaie calculerToutesLesValeurs(Long bulletinId) {
        BulletinPaie bulletin = bulletinPaieRepository.findById(bulletinId);
        if (bulletin == null) {
            throw new BulletinPaieNotFoundException(bulletinId);
        }

        BigDecimal salaireDeBase = bulletin.getSalaireDeBase();
        if (salaireDeBase == null || salaireDeBase.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Le salaire de base doit être supérieur à zéro");
        }

        BigDecimal totalPrime = recalculerTotalPrime(bulletinId);

        BigDecimal heuresTravaille = bulletin.getHeurTravaille() != null ? bulletin.getHeurTravaille() : BigDecimal.ZERO;

        BigDecimal salaireBrute = salaireDeBase.add(heuresTravaille).add(totalPrime);
        BigDecimal chargesSalariales = salaireBrute.multiply(BigDecimal.valueOf(0.02));
        BigDecimal baseIrsa = salaireBrute.subtract(chargesSalariales);
        BigDecimal irsa = calculerIrsa(baseIrsa);
        BigDecimal salaireNet = salaireBrute.subtract(chargesSalariales).subtract(irsa);
        BigDecimal chargePatronal = salaireBrute.multiply(BigDecimal.valueOf(0.19));
        BigDecimal coutGlobal = salaireBrute.add(chargePatronal);

        bulletin.setTotalPrime(totalPrime);
        bulletin.setSalaireBrute(salaireBrute);
        bulletin.setBaseIrsa(baseIrsa);
        bulletin.setIrsa(irsa);
        bulletin.setSalaireNet(salaireNet);
        bulletin.setChargePatronal(chargePatronal);
        bulletin.setCoutGlobale(coutGlobal);

        bulletinPaieRepository.update(bulletin.getId(), bulletin);

        return bulletin;
    }

    private BigDecimal calculerIrsa(BigDecimal baseIrsa) {
        if (baseIrsa == null || baseIrsa.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        if (baseIrsa.compareTo(new BigDecimal("200000")) <= 0) {
            return BigDecimal.ZERO;
        }
        if (baseIrsa.compareTo(new BigDecimal("250000")) <= 0) {
            return new BigDecimal("5000").add(baseIrsa.subtract(new BigDecimal("200000")).multiply(BigDecimal.valueOf(0.05)));
        }
        if (baseIrsa.compareTo(new BigDecimal("350000")) <= 0) {
            return new BigDecimal("12500").add(baseIrsa.subtract(new BigDecimal("250000")).multiply(BigDecimal.valueOf(0.10)));
        }
        if (baseIrsa.compareTo(new BigDecimal("400000")) <= 0) {
            return new BigDecimal("25000").add(baseIrsa.subtract(new BigDecimal("350000")).multiply(BigDecimal.valueOf(0.15)));
        }
        if (baseIrsa.compareTo(new BigDecimal("500000")) <= 0) {
            return new BigDecimal("37500").add(baseIrsa.subtract(new BigDecimal("400000")).multiply(BigDecimal.valueOf(0.15)));
        }
        if (baseIrsa.compareTo(new BigDecimal("600000")) <= 0) {
            return new BigDecimal("52500").add(baseIrsa.subtract(new BigDecimal("500000")).multiply(BigDecimal.valueOf(0.20)));
        }
        return new BigDecimal("72500").add(baseIrsa.subtract(new BigDecimal("600000")).multiply(BigDecimal.valueOf(0.25)));
    }

    /**
     * Recalcule la totalité des valeurs de paie d'un bulletin.
     * <p>
     * Ordre de calcul verrouillé : salaire brut → base IRSA → IRSA → salaire net → charges patronales → coût global.
     * Les valeurs stockées dans la base sont à la fois la source et la cible des recalculs.
     */
    @Transactional
    public BulletinPaie recalculerToutesLesValeurs(long bulletinId) {
        BulletinPaie bulletin = bulletinPaieRepository.findById(bulletinId);
        if (bulletin == null) {
            throw new BulletinPaieNotFoundException(bulletinId);
        }

        BigDecimal salaireDeBase = bulletin.getSalaireDeBase();
        if (salaireDeBase == null || salaireDeBase.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Le salaire de base doit être supérieur à zéro");
        }

        BigDecimal totalPrime = recalculerTotalPrime(bulletinId);

        BigDecimal heuresTravaille = bulletin.getHeurTravaille() != null ? bulletin.getHeurTravaille() : BigDecimal.ZERO;

        BigDecimal salaireBrute = salaireDeBase.add(heuresTravaille).add(totalPrime);
        bulletinPaieRepository.mettreAJourSalaireBrut(bulletinId, salaireBrute);

        BigDecimal chargesSalariales = salaireBrute.multiply(BigDecimal.valueOf(0.02));
        BigDecimal baseIrsa = salaireBrute.subtract(chargesSalariales);
        int lignes = bulletinPaieRepository.mettreAJourBaseIrsa(bulletinId, baseIrsa);
        if (lignes != 1) {
            throw new IllegalStateException("Impossible de mettre à jour la base IRSA du bulletin : " + bulletinId);
        }

        BigDecimal irsa = calculerIrsa(baseIrsa);
        lignes = bulletinPaieRepository.mettreAJourIrsa(bulletinId, irsa);
        if (lignes != 1) {
            throw new IllegalStateException("Impossible de mettre à jour l'IRSA du bulletin : " + bulletinId);
        }

        BigDecimal salaireNet = salaireBrute.subtract(chargesSalariales).subtract(irsa);
        lignes = bulletinPaieRepository.mettreAJourSalaireNet(bulletinId, salaireNet);
        if (lignes != 1) {
            throw new IllegalStateException("Impossible de mettre à jour le salaire net du bulletin : " + bulletinId);
        }

        BigDecimal chargePatronal = salaireBrute.multiply(BigDecimal.valueOf(0.19));
        lignes = bulletinPaieRepository.mettreAJourChargePatronal(bulletinId, chargePatronal);
        if (lignes != 1) {
            throw new IllegalStateException("Impossible de mettre à jour les charges patronales du bulletin : " + bulletinId);
        }

        BigDecimal coutGlobal = salaireBrute.add(chargePatronal);
        lignes = bulletinPaieRepository.mettreAJourCoutGlobale(bulletinId, coutGlobal);
        if (lignes != 1) {
            throw new IllegalStateException("Impossible de mettre à jour le coût global du bulletin : " + bulletinId);
        }

        bulletin.setSalaireBrute(salaireBrute);
        bulletin.setBaseIrsa(baseIrsa);
        bulletin.setIrsa(irsa);
        bulletin.setSalaireNet(salaireNet);
        bulletin.setChargePatronal(chargePatronal);
        bulletin.setCoutGlobale(coutGlobal);

        return bulletin;
    }

}
