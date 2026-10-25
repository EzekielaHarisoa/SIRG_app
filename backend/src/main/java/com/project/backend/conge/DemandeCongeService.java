package com.project.backend.conge;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class DemandeCongeService {

    private final DemandeCongeRepository demandeCongeRepository;

    public DemandeCongeService(DemandeCongeRepository demandeCongeRepository) {
        this.demandeCongeRepository = demandeCongeRepository;
    }

    public List<DemandeConge> findAllDemandeConge() {
        return demandeCongeRepository.findAllDemandeConge();
    }

    public DemandeConge findById(long id) {
        if(id<=0) {
            throw  new IllegalArgumentException("L'identifiant doit etre superieur a zero");
        }
        return demandeCongeRepository.findById(id)
                .orElseThrow(
                        ()-> new DemandeCongeNotFoundException("Aucune demande de conge trouve avec l'identifiant" + id)
                );
    }

    public List<DemandeConge> findByNumeroMatricule(long numeroMatricule) {
        if(numeroMatricule<=0) {
            throw  new IllegalArgumentException(" Le numéro matricule doit être positif ");
        }
        return demandeCongeRepository.findByNumeroMatricule(numeroMatricule);
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

        if(dateDebut == null || dateFin == null) {
            throw new IllegalArgumentException(
                    "Les dates de début et de fin sont obligatoires"
            );
        }
        if(dateFin.isBefore(dateDebut)) {
            throw  new IllegalArgumentException(
                    "La date de fin ne peut pas être antérieure à la date de début"
            );
        }

        if (numeroMatricule == null || numeroMatricule <= 0) {
            throw new IllegalArgumentException(
                    "Un numéro matricule positif est obligatoire."
            );
        }
        return demandeCongeRepository.save(demandeConge);
    }
}
