
package com.project.backend.paie;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class BulletinPaieService {

    private final BulletinPaieRepository bulletinPaieRepository;

    public BulletinPaieService(BulletinPaieRepository bulletinPaieRepository) {
        this.bulletinPaieRepository = bulletinPaieRepository;
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

    public int save(BulletinPaie bulletin) {
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

        return salaireDeBase.add(totalPrime);
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

        BigDecimal salaireBrut = salaireDeBase.add(totalPrime);

        int lignesModifiees = bulletinPaieRepository.mettreAJourSalaireBrut(bulletinId, salaireBrut);
        if (lignesModifiees != 1) {
            throw new IllegalStateException("Impossible de mettre à jour le salaire brut du bulletin : " + bulletinId);
        }

        return salaireBrut;
    }

}
