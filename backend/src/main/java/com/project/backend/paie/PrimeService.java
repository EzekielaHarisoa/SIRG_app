package com.project.backend.paie;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PrimeService {

    private final PrimeRepository primeRepository;
    private final JdbcTemplate jdbcTemplate;

    public PrimeService(PrimeRepository primeRepository, JdbcTemplate jdbcTemplate) {
        this.primeRepository = primeRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Prime> findAll() {
        return primeRepository.findAll();
    }

    public List<Prime> findByNumeroMatricule(Long numeroMatricule) {
        if (numeroMatricule == null || numeroMatricule <= 0) {
            throw new IllegalArgumentException("Le numéro matricule est obligatoire");
        }
        return primeRepository.findByNumeroMatricule(numeroMatricule);
    }

    public List<Prime> findByBulletinPaieId(Long bulletinPaieId) {
        if (bulletinPaieId == null || bulletinPaieId <= 0) {
            throw new IllegalArgumentException("L'identifiant du bulletin est invalide");
        }
        return primeRepository.findByBulletinPaieId(bulletinPaieId);
    }

    public Prime findById(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("L'identifiant de la prime est invalide");
        }
        Prime prime = primeRepository.findById(id);
        if (prime == null) {
            throw new PrimeNotFoundException(id);
        }
        return prime;
    }

    @Transactional
    public Prime save(Prime prime) {
        if (prime == null) {
            throw new IllegalArgumentException("Les données de la prime sont obligatoires");
        }
        Integer rows = primeRepository.save(prime);
        if (rows == null || rows == 0) {
            throw new IllegalStateException("Impossible de créer la prime");
        }
        return primeRepository.findById(prime.getId());
    }

    @Transactional
    public Prime update(Prime prime) {
        if (prime == null || prime.getId() == null || prime.getId() <= 0) {
            throw new IllegalArgumentException("L'identifiant de la prime est invalide");
        }
        Prime existing = primeRepository.findById(prime.getId());
        if (existing == null) {
            throw new PrimeNotFoundException(prime.getId());
        }

        Integer rows;
        if (prime.getBulletinPaieId() != null) {
            rows = primeRepository.update(prime);
        } else if (existing.getBulletinPaieId() != null) {
            throw new IllegalStateException(
                "Cette prime est déjà associée à un bulletin et ne peut pas être désassociée"
            );
        } else {
            rows = primeRepository.update(prime);
        }

        if (rows == null || rows == 0) {
            throw new IllegalStateException("Impossible de modifier la prime : " + prime.getId());
        }

        return primeRepository.findById(prime.getId());
    }

    @Transactional
    public Integer delete(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("L'identifiant de la prime est invalide");
        }
        return primeRepository.delete(id);
    }

    @Transactional
    public Prime associerAuBulletin(Prime prime, Long bulletinPaieId) {
        if (prime == null || bulletinPaieId == null || bulletinPaieId <= 0) {
            throw new IllegalArgumentException(
                "Une prime et un bulletin valides sont requis"
            );
        }

        Prime existing = primeRepository.findById(prime.getId());
        if (existing == null) {
            throw new PrimeNotFoundException(prime.getId());
        }

        if (existing.getBulletinPaieId() != null && !existing.getBulletinPaieId().equals(bulletinPaieId)) {
            throw new IllegalStateException(
                "Cette prime est déjà associée à un autre bulletin"
            );
        }

        if (!isSameEmployee(existing, bulletinPaieId)) {
            throw new IllegalStateException(
                "La prime et le bulletin ne concernent pas le même employé"
            );
        }

        Prime updated = new Prime(
            existing.getId(),
            existing.getLibelle(),
            existing.getMontant(),
            existing.getNumeroMatricule(),
            bulletinPaieId
        );

        Integer rows = primeRepository.update(updated);
        if (rows == null || rows == 0) {
            throw new IllegalStateException("Impossible d'associer la prime au bulletin");
        }

        return primeRepository.findById(existing.getId());
    }

    @Transactional
    public Prime desassocierDeBulletin(Prime prime) {
        if (prime == null) {
            throw new IllegalArgumentException("La prime est requise");
        }

        Prime existing = primeRepository.findById(prime.getId());
        if (existing == null) {
            throw new PrimeNotFoundException(prime.getId());
        }

        if (existing.getBulletinPaieId() == null) {
            throw new IllegalStateException("Cette prime n'est pas encore associée à un bulletin");
        }

        Prime updated = new Prime(
            existing.getId(),
            existing.getLibelle(),
            existing.getMontant(),
            existing.getNumeroMatricule(),
            null
        );

        Integer rows = primeRepository.update(updated);
        if (rows == null || rows == 0) {
            throw new IllegalStateException("Impossible de désassocier la prime du bulletin");
        }

        return primeRepository.findById(existing.getId());
    }

    private boolean isSameEmployee(Prime prime, Long bulletinPaieId) {
        if (prime.getNumeroMatricule() == null) {
            return true;
        }

        Long bulletinMatricule = jdbcTemplate.queryForObject(
            "SELECT numero_matricule FROM buletin_paie WHERE id = ?",
            Long.class,
            bulletinPaieId
        );

        return bulletinMatricule != null && bulletinMatricule.equals(prime.getNumeroMatricule());
    }
}
