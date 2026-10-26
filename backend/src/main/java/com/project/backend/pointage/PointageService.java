
package com.project.backend.pointage;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class PointageService {

    private final PointageRepository pointageRepository;

    private static final LocalTime HEURE_ENTREE_OFFICIELLE =
            LocalTime.of(8, 0);

    private static final int DUREE_TRAVAIL_MINUTES = 8 * 60;
    private static final int PAUSE_MINUTES = 60;
    private static final int TOLERANCE_RETARD_MINUTES = 0;

    public PointageService(PointageRepository pointageRepository) {
        this.pointageRepository = pointageRepository;
    }

    public List<Pointage> findAllPointage() {
        return pointageRepository.findAllPointage();
    }

    public List<Pointage> findPointageByDate(LocalDate date) {
        if (date == null) {
            throw new IllegalArgumentException(
                    "La date du pointage est obligatoire."
            );
        }

        return pointageRepository.findPointageByDate(date);
    }

    public List<Pointage> findPointageByNumeroMatricule(
            long numeroMatricule) {

        if (numeroMatricule <= 0) {
            throw new IllegalArgumentException(
                    "Le numéro matricule doit être positif."
            );
        }

        return pointageRepository
                .findPointageByNumeroMatricule(numeroMatricule);
    }

    public Pointage fairePointage(Pointage pointage) {

        if (pointage == null) {
            throw new IllegalArgumentException(
                    "Les données du pointage sont obligatoires."
            );
        }

        LocalDateTime entree = pointage.getHeureEntree();
        LocalDateTime sortie = pointage.getHeureSortie();
        LocalDate date = pointage.getDatePointage();
        Long matricule = pointage.getNumeroMatricule();

        if (entree == null) {
            throw new IllegalArgumentException(
                    "L'heure d'entrée est obligatoire."
            );
        }

        if (sortie == null) {
            throw new IllegalArgumentException(
                    "L'heure de sortie est obligatoire."
            );
        }

        if (date == null) {
            throw new IllegalArgumentException(
                    "La date du pointage est obligatoire."
            );
        }

        if (matricule == null || matricule <= 0) {
            throw new IllegalArgumentException(
                    "Un numéro matricule valide est obligatoire."
            );
        }

        if (!sortie.isAfter(entree)) {
            throw new IllegalArgumentException(
                    "L'heure de sortie doit être après l'heure d'entrée."
            );
        }


        if (!entree.toLocalDate().equals(date)
                || !sortie.toLocalDate().equals(date)) {
            throw new IllegalArgumentException(
                    "Les heures d'entrée et de sortie doivent "
                            + "correspondre à la date du pointage."
            );
        }

        pointage.setRetardMinute(calculerRetard(entree));

        pointage.setHeureSup(calculerHeuresSup(entree, sortie));

        return pointageRepository.fairePointage(pointage);
    }

    private int calculerRetard(LocalDateTime heureEntree) {

        long minutes = ChronoUnit.MINUTES.between(
                HEURE_ENTREE_OFFICIELLE,
                heureEntree.toLocalTime()
        );

        return (int) Math.max(
                0,
                minutes - TOLERANCE_RETARD_MINUTES
        );
    }

    private BigDecimal calculerHeuresSup(
            LocalDateTime heureEntree,
            LocalDateTime heureSortie) {

        long minutesPresence = Duration.between(
                heureEntree,
                heureSortie
        ).toMinutes();

        long minutesTravaillees =
                Math.max(0, minutesPresence - PAUSE_MINUTES);

        long minutesSup = Math.max(
                0,
                minutesTravaillees - DUREE_TRAVAIL_MINUTES
        );

        return BigDecimal.valueOf(minutesSup)
                .divide(
                        BigDecimal.valueOf(60),
                        2,
                        RoundingMode.HALF_UP
                );
    }
}
