package com.project.backend.pointage;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PointageService {
    private final PointageRepository pointageRepository;

    public  PointageService(PointageRepository pointageRepository) {
        this.pointageRepository = pointageRepository;
    }

    public List<Pointage> findAllPointage() {
        return pointageRepository.findAllPointage();
    }

    public List<Pointage> findPointageByDate (LocalDate date) {
        return pointageRepository.findPointageByDate(date);
    }

    public List<Pointage> findPointageByNumeroMatricule(long numeroMatricule) {
        return pointageRepository.findPointageByNumeroMatricule(numeroMatricule);
    }

    public Pointage fairePointage(Pointage pointage) {
        return pointageRepository.fairePointage(pointage);
    }

}
