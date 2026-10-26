package com.project.backend.employe;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
public class EmployeController {

    private final EmployeService employeService;

    public EmployeController(EmployeService employeService) {
        this.employeService = employeService;
    }

    @GetMapping("/employe")
    public List<Employe> findAllEmploye() {
        return employeService.findAllEmploye();
    }

    @PostMapping("/employe")
    public Employe ajouterEmploye(@Valid @RequestBody  Employe employe) {
        return employeService.ajouterEmploye(employe);
    }

    @PutMapping("/employe/{numeroMatricule}")
    public  Employe modifierEmploye(@PathVariable long numeroMatricule, @Valid @RequestBody  Employe employe) {
        return employeService.modifierEmploye(numeroMatricule, employe);
    }
}
