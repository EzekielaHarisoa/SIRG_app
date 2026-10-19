package com.project.backend.employe;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeService {
    private final EmployeRepository employeRepository;

    public  EmployeService(EmployeRepository employeRepository) {
        this.employeRepository = employeRepository;
    }

    public List<Employe> findAllEmploye() {
        return employeRepository.findAllEmploye();
    }

    public Employe ajouterEmploye(Employe employe) {
        return employeRepository.ajoutEmploye(
                employe.getNomEtPrenoms(),
                employe.getTelephone(),
                employe.getAdresse(),
                employe.getDateEmbauche(),
                employe.getEntrepriseId(),
                employe.getPosteId()
        );
    }

    public Employe modifierEmploye(long numeroMatricule, Employe employe) {
        return employeRepository.modifierEmploye(
                numeroMatricule,
                employe.getNomEtPrenoms(),
                employe.getTelephone(),
                employe.getAdresse(),
                employe.getDateEmbauche(),
                employe.getEntrepriseId(),
                employe.getPosteId()
        );
    }


}
