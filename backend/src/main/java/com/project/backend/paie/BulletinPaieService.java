package com.project.backend.paie;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BulletinPaieService {

    private final BulletinPaieRepository bulletinPaieRepository;

    public BulletinPaieService (BulletinPaieRepository bulletinPaieRepository) {
        this.bulletinPaieRepository = bulletinPaieRepository;
    }

    public List<BulletinPaie> findAll() {
        return bulletinPaieRepository.findAll();
    }

    public BulletinPaie findById(long id) {
        return bulletinPaieRepository.findById(id);
    }

    public List<BulletinPaie> findByNumeroMatricule(long numeroMatricule) {
        return bulletinPaieRepository.findByNumeroMatricule(numeroMatricule);
    }

    public int save(BulletinPaie bulletin) {
        return bulletinPaieRepository.save(bulletin);
    }
}
