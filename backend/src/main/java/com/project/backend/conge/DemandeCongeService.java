
package com.project.backend.conge;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import com.project.backend.conge.TrancheConge.TrancheConge;
import com.project.backend.conge.TrancheConge.TrancheCongeRepository;
import com.project.backend.employe.Employe;
import com.project.backend.employe.EmployeRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.ArrayList;
import java.util.Date;

@Service
public class DemandeCongeService {

    private final TrancheCongeRepository trancheCongeRepository;
    private final EmployeRepository employeRepository;
    private final DemandeCongeRepository demandeCongeRepository;

    private static final Set<String> TYPES_CONGE_AUTORISES = Set.of(
            "MATERNITE",
            "PATERNITE",
            "PERMISSION",
            "MALADIE",
            "CONGE_PAYE"
    );

    public DemandeCongeService(DemandeCongeRepository demandeCongeRepository, TrancheCongeRepository trancheCongeRepository, EmployeRepository employeRepository) {
        this.demandeCongeRepository = demandeCongeRepository;
        this.trancheCongeRepository = trancheCongeRepository;
        this.employeRepository = employeRepository;
    }


    public List<DemandeConge> findAllDemandeConge() {
        return demandeCongeRepository.findAllDemandeConge();
    }

    public DemandeConge findById(long id) {

        if (id <= 0) {
            throw new IllegalArgumentException(
                    "L'identifiant doit être supérieur à zéro."
            );
        }

        return demandeCongeRepository.findById(id)
                .orElseThrow(() ->
                        new DemandeCongeNotFoundException(
                                "Aucune demande de congé trouvée avec l'identifiant : " + id
                        )
                );
    }

    public List<DemandeConge> findByNumeroMatricule(long numeroMatricule) {

        if (numeroMatricule <= 0) {
            throw new IllegalArgumentException(
                    "Le numéro matricule doit être positif."
            );
        }

        return demandeCongeRepository.findByNumeroMatricule(
                numeroMatricule
        );
    }

    public int save(DemandeConge demandeConge) {

        if (demandeConge == null) {
            throw new IllegalArgumentException(
                    "La demande de congé ne doit pas être vide."
            );
        }

        LocalDate dateDebut = demandeConge.getDateDeDebut();
        LocalDate dateFin = demandeConge.getDateFin();
        Long numeroMatricule = demandeConge.getNumeroMatricule();
        String typeConge = demandeConge.getTypeConge();

        if (dateDebut == null || dateFin == null) {
            throw new IllegalArgumentException(
                    "Les dates de début et de fin sont obligatoires."
            );
        }

        if (dateFin.isBefore(dateDebut)) {
            throw new IllegalArgumentException(
                    "La date de fin ne peut pas être antérieure à la date de début."
            );
        }

        if (numeroMatricule == null || numeroMatricule <= 0) {
            throw new IllegalArgumentException(
                    "Un numéro matricule positif est obligatoire."
            );
        }

        if (typeConge == null ||
                !TYPES_CONGE_AUTORISES.contains(typeConge)) {

            throw new IllegalArgumentException(
                    "Le type de congé est invalide."
            );
        }

        boolean chevauchement = demandeCongeRepository.existsChevauchement(numeroMatricule, dateDebut, dateFin);

        if (chevauchement) {
            throw new IllegalStateException(
                    "Une autre demande de congé ou d'absence existe déjà sur cette période."
            );
        }

        return demandeCongeRepository.save(demandeConge);
    }

    public void refuserDemande(long id, String motifRefus) {

        if (id <= 0) {
            throw new IllegalArgumentException(
                    "L'identifiant doit être positif."
            );
        }

        if (motifRefus == null || motifRefus.isBlank()) {
            throw new IllegalArgumentException(
                    "Le motif de refus est obligatoire."
            );
        }

        if (motifRefus.length() > 255) {
            throw new IllegalArgumentException(
                    "Le motif de refus ne doit pas dépasser 255 caractères."
            );
        }

        // Vérifier que la demande existe
        DemandeConge demande = findById(id);

        // Vérifier qu'elle est encore en attente
        if (!"EN_ATTENTE".equals(demande.getStatus())) {
            throw new IllegalStateException(
                    "Cette demande a déjà été traitée."
            );
        }

        int lignesModifiees = demandeCongeRepository.refuserDemande(
                id,
                motifRefus.trim()
        );

        if (lignesModifiees == 0) {
            throw new IllegalStateException(
                    "La demande a déjà été traitée."
            );
        }
    }

    @Transactional
    public void accepterDemande(long id) {

        if (id <= 0) {
            throw new IllegalArgumentException(
                    "L'identifiant doit être positif."
            );
        }

        DemandeConge demande = findById(id);

        if (!"EN_ATTENTE".equals(demande.getStatus())) {
            throw new IllegalStateException(
                    "Cette demande a déjà été traitée."
            );
        }

        // 3. Récupérer l'employé
        Employe employe = employeRepository.getemployeById(
                demande.getNumeroMatricule()
        );

        LocalDate dateEmbauche = new java.sql.Date(
                employe.getDateEmbauche().getTime()
        ).toLocalDate();

        LocalDate premierAnniversaire = dateEmbauche.plusYears(1);

        LocalDate dateDebut = demande.getDateDeDebut();
        LocalDate dateFin = demande.getDateFin();

        // 4. Séparer absence et congé payé
        if (dateDebut.isBefore(premierAnniversaire)) {

            LocalDate finAbsence = dateFin.isBefore(premierAnniversaire)
                    ? dateFin
                    : premierAnniversaire.minusDays(1);

            double joursAbsence = ChronoUnit.DAYS.between(
                    dateDebut,
                    finAbsence
            ) + 1;

            demandeCongeRepository.enregistrerPeriode(
                    id,
                    dateDebut,
                    finAbsence,
                    "ABSENCE",
                    joursAbsence
            );
        }

        // 5. Déterminer la partie en congé payé
        LocalDate debutCongePaye = dateDebut.isBefore(premierAnniversaire)
                ? premierAnniversaire
                : dateDebut;

        if (!debutCongePaye.isAfter(dateFin)) {

            double joursConge = ChronoUnit.DAYS.between(
                    debutCongePaye,
                    dateFin
            ) + 1;

            consommerTranches(
                    id,
                    demande.getNumeroMatricule(),
                    debutCongePaye,
                    joursConge
            );
        }

        int lignesModifiees = demandeCongeRepository.accepterDemande(id);

        if (lignesModifiees == 0) {
            throw new IllegalStateException(
                    "La demande a déjà été traitée."
            );
        }
    }

    private void consommerTranches(
            long demandeId,
            long numeroMatricule,
            LocalDate dateDebut,
            double joursDemandes
    ) {

        // Récupérer les tranches disponibles avec verrouillage
        List<TrancheConge> tranches = trancheCongeRepository.findTranchesDisponiblesForUpdate(
                        numeroMatricule,
                        LocalDate.now()
                );

        double joursRestants = joursDemandes;

        for (TrancheConge tranche : tranches) {

            double joursConsommes =
                    trancheCongeRepository.calculerJoursConsommes(
                            tranche.getId()
                    );

            double disponible = Math.max(
                    0,
                    tranche.getJoursAcquis() - joursConsommes
            );

            if (disponible <= 0) {
                continue;
            }

            double joursAConsommer = Math.min(
                    disponible,
                    joursRestants
            );

            // Enregistrer la période
            long periodeId = demandeCongeRepository.enregistrerPeriode(
                    demandeId,
                    dateDebut,
                    dateDebut.plusDays((long) joursAConsommer - 1),
                    "CONGE_PAYE",
                    joursAConsommer
            );

            // Enregistrer la consommation
            trancheCongeRepository.enregistrerConsommation(
                    periodeId,
                    tranche.getId(),
                    joursAConsommer
            );

            joursRestants -= joursAConsommer;

            if (joursRestants <= 0) {
                break;
            }
        }

        if (joursRestants > 0) {
            throw new IllegalStateException(
                    "Solde de congés insuffisant. Jours manquants : "
                            + joursRestants
            );
        }
    }
}
