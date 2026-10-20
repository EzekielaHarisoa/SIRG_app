package com.project.backend.paie;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class BulletinPaieController {

    private final BulletinPaieService bulletinPaieService;

    public BulletinPaieController(BulletinPaieService bulletinPaieService) {
        this.bulletinPaieService = bulletinPaieService;
    }

    @GetMapping("/bulletinPaie")
    public List<BulletinPaie> findAll() {
        return bulletinPaieService.findAll();
    }
    @GetMapping("/bulletinPaie/byId/{id}")
    public BulletinPaie findbyId( @PathVariable long id) {
        return bulletinPaieService.findById(id);
    }

    @GetMapping("/bulletinPaie/emploie/{numeroMatricule}")
    public List<BulletinPaie> findMatricule( @PathVariable long numeroMatricule) {
        return bulletinPaieService.findByNumeroMatricule(numeroMatricule);
    }

    @PostMapping("/bulletinPaie")
    public int save(@RequestBody BulletinPaie bulletinPaie) {
        return bulletinPaieService.save(bulletinPaie);
    }
}
