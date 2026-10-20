package com.project.backend.conge;

import org.springframework.stereotype.Service;

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

    public List<DemandeConge> findById(long id) {
        return demandeCongeRepository.findById(id);
    }

    public List<DemandeConge> findByNumeroMatricule(long numeroMatricule) {
        return demandeCongeRepository.findByNumeroMatricule(numeroMatricule);
    }

    public int save(DemandeConge demandeConge) {
        return demandeCongeRepository.save(demandeConge);
    }
}
