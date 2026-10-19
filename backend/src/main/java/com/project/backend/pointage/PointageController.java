package com.project.backend.pointage;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
public class PointageController {

    private  final PointageService pointageService;

    public PointageController(PointageService pointageService) {
        this.pointageService = pointageService;
    }

    @GetMapping("/pointage")
    public List<Pointage> findAllPointage() {
        return pointageService.findAllPointage();
    }

    @GetMapping("/pointage/filtreDate/{date}")
    public  List<Pointage> findPointageByDate(@PathVariable LocalDate date) {
        return pointageService.findPointageByDate(date);
    }

    @GetMapping("/pointage/filtreMatricule/{numeroMatricule}")
    public List<Pointage> findPointageByNumeroMatricule(@PathVariable long numeroMatricule) {
        return pointageService.findPointageByNumeroMatricule(numeroMatricule);
    }

    @PostMapping("/pointage")
    public Pointage fairePointage(@RequestBody Pointage pointage) {
        return  pointageService.fairePointage(pointage);
    }
}
