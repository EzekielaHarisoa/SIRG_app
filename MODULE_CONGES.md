# Module de gestion des congés — SIRG

Contenu source des classes du package `com.project.backend.conge`.

- **Backend** : Java 21, Spring Boot, Spring JDBC (`JdbcTemplate`), Oracle Database.
- **Chemin** : `backend/src/main/java/com/project/backend/conge/`
- Le contenu ci-dessous est reproduit **tel quel** depuis le dépôt (aucune correction appliquée).

---

## A. Gestion des demandes de congés

### 1. `DemandeConge.java`

```java
package com.project.backend.conge;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class DemandeConge {

    private Long id;

    @Size(max = 255, message = "Le motif ne doit pas dépasser 255 caractères.")
    private String motif;

    @Pattern(
            regexp = "ACCEPTER|REFUSER|EN_ATTENTE",
            message = "Le statut doit être ACCEPTER, REFUSER ou EN_ATTENTE."
    )
    private String status;

    @NotBlank(message = "Le type de congé est obligatoire.")
    @Pattern(
            regexp = "MATERNITE|PATERNITE|PERMISSION|MALADIE|CONGE_PAYE",
            message = "Le type de congé n'est pas valide."
    )
    private String typeConge;

    private LocalDate dateDeDemande;

    @NotNull(message = "La date de début est obligatoire.")
    private LocalDate dateDeDebut;

    @NotNull(message = "La date de fin est obligatoire.")
    private LocalDate dateFin;

    @Size(max = 255, message = "Le motif du refus ne doit pas dépasser 255 caractères.")
    private String motifRefus;

    @NotNull(message = "Le numéro matricule est obligatoire.")
    @Positive(message = "Le numéro matricule doit être positif.")
    private Long numeroMatricule;

    public DemandeConge() {
    }

    public DemandeConge(
            Long id,
            String motif,
            String status,
            String typeConge,
            LocalDate dateDeDemande,
            LocalDate dateDeDebut,
            LocalDate dateFin,
            String motifRefus,
            Long numeroMatricule
    ) {
        this.id = id;
        this.motif = motif;
        this.status = status;
        this.typeConge = typeConge;
        this.dateDeDemande = dateDeDemande;
        this.dateDeDebut = dateDeDebut;
        this.dateFin = dateFin;
        this.motifRefus = motifRefus;
        this.numeroMatricule = numeroMatricule;
    }

    @JsonIgnore
    @AssertTrue(message = "La date de fin doit être égale ou postérieure à la date de début.")
    public boolean isPeriodeValide() {
        if (dateDeDebut == null || dateFin == null) {
            return true;
        }

        return !dateFin.isBefore(dateDeDebut);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMotif() {
        return motif;
    }

    public void setMotif(String motif) {
        this.motif = motif;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTypeConge() {
        return typeConge;
    }

    public void setTypeConge(String typeConge) {
        this.typeConge = typeConge;
    }

    public LocalDate getDateDeDemande() {
        return dateDeDemande;
    }

    public void setDateDeDemande(LocalDate dateDeDemande) {
        this.dateDeDemande = dateDeDemande;
    }

    public LocalDate getDateDeDebut() {
        return dateDeDebut;
    }

    public void setDateDeDebut(LocalDate dateDeDebut) {
        this.dateDeDebut = dateDeDebut;
    }

    public LocalDate getDateFin() {
        return dateFin;
    }

    public void setDateFin(LocalDate dateFin) {
        this.dateFin = dateFin;
    }

    public String getMotifRefus() {
        return motifRefus;
    }

    public void setMotifRefus(String motifRefus) {
        this.motifRefus = motifRefus;
    }

    public Long getNumeroMatricule() {
        return numeroMatricule;
    }

    public void setNumeroMatricule(Long numeroMatricule) {
        this.numeroMatricule = numeroMatricule;
    }
}
```

### 2. `DemandeCongeController.java`

```java
package com.project.backend.conge;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class DemandeCongeController {

    private final DemandeCongeService demandeCongeService;

    public DemandeCongeController(DemandeCongeService demandeCongeService) {
        this.demandeCongeService = demandeCongeService;
    }

    @GetMapping("/demandeConge")
    public List<DemandeConge> findAllDemandeConge() {
        return demandeCongeService.findAllDemandeConge();
    }

    @GetMapping("/demandeConge/byId/{id}")
    public DemandeConge findById(@PathVariable long id) {
        return demandeCongeService.findById(id);
    }

    @GetMapping("/demandeConge/employe/{numeroMatricule}")
    public List<DemandeConge> findByNumeroMatricule(@PathVariable long numeroMatricule) {
        return demandeCongeService.findByNumeroMatricule(numeroMatricule);
    }

    @PostMapping("/demandeConge")
    @ResponseStatus(HttpStatus.CREATED)
    public int save(@Valid @RequestBody DemandeConge demandeConge) {
        return demandeCongeService.save(demandeConge);
    }

}
```

### 3. `DemandeCongeService.java`

```java
package com.project.backend.conge;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
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

    public DemandeConge findById(long id) {
        if(id<=0) {
            throw  new IllegalArgumentException("L'identifiant doit etre superieur a zero");
        }
        return demandeCongeRepository.findById(id)
                .orElseThrow(
                        ()-> new DemandeCongeNotFoundException("Aucune demande de conge trouve avec l'identifiant" + id)
                );
    }

    public List<DemandeConge> findByNumeroMatricule(long numeroMatricule) {
        if(numeroMatricule<=0) {
            throw  new IllegalArgumentException(" Le numéro matricule doit être positif ");
        }
        return demandeCongeRepository.findByNumeroMatricule(numeroMatricule);
    }

    public int save(DemandeConge demandeConge) {
        if (demandeConge == null) {
            throw new IllegalArgumentException(
                    "La demande de congé ne doit pas être vide."
            );
        }

        LocalDate dateDebut = demandeConge.getDateDeDebut();
        LocalDate dateFin = demandeConge.getDateFin();
        Long numeroMatricule = demandeConge.getNumeroMatricule();

        if(dateDebut == null || dateFin == null) {
            throw new IllegalArgumentException(
                    "Les dates de début et de fin sont obligatoires"
            );
        }
        if(dateFin.isBefore(dateDebut)) {
            throw  new IllegalArgumentException(
                    "La date de fin ne peut pas être antérieure à la date de début"
            );
        }

        if (numeroMatricule == null || numeroMatricule <= 0) {
            throw new IllegalArgumentException(
                    "Un numéro matricule positif est obligatoire."
            );
        }
        return demandeCongeRepository.save(demandeConge);
    }
}
```

### 4. `DemandeCongeRepository.java`

```java
package com.project.backend.conge;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
public class DemandeCongeRepository {

    private final JdbcTemplate jdbcTemplate;

    public DemandeCongeRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private DemandeConge mapDemandeConge(java.sql.ResultSet rs, int nrw) throws SQLException {
        DemandeConge demandeConge = new DemandeConge();

        demandeConge.setId(rs.getLong("id"));
        demandeConge.setMotif(rs.getString("motif"));
        demandeConge.setStatus(rs.getString("status"));
        demandeConge.setTypeConge(rs.getString("type_conge"));

        Date dateDemande = rs.getDate("date_de_demande");
        if(dateDemande != null ) {
            demandeConge.setDateDeDemande(dateDemande.toLocalDate());
        }

        Date dateDebut = rs.getDate("date_de_debut");
        if(dateDebut != null) {
            demandeConge.setDateDeDebut(dateDebut.toLocalDate());
        }

        Date dateFin = rs.getDate("date_fin");
        if(dateFin != null ) {
            demandeConge.setDateFin(dateFin.toLocalDate());
        }

        demandeConge.setMotifRefus(rs.getString("motif_refus"));
        demandeConge.setNumeroMatricule(rs.getLong("numero_matricule"));

        return demandeConge;
    }

    public List<DemandeConge> findAllDemandeConge() {
        String sql = """
            SELECT id, motif, status, type_conge,
                   date_de_demande, date_de_debut, date_fin,
                   motif_refus, numero_matricule
            FROM demande_conges
            ORDER BY date_de_demande DESC
            """;
        return  jdbcTemplate.query(sql,  this::mapDemandeConge);

    }

    public Optional<DemandeConge> findById(long id) {
        String sql = """
            SELECT id, motif, status, type_conge,
                   date_de_demande, date_de_debut, date_fin,
                   motif_refus, numero_matricule
            FROM demande_conges 
            WHERE id = ?
            ORDER BY date_de_demande DESC
            """;
        List<DemandeConge> resultat = jdbcTemplate.query(sql,this::mapDemandeConge, id);

        return resultat.stream().findFirst();
    }

    public List<DemandeConge> findByNumeroMatricule(long numeroMatricule) {
        String sql = """
            SELECT id, motif, status, type_conge,
                   date_de_demande, date_de_debut, date_fin,
                   motif_refus, numero_matricule
            FROM demande_conges 
            WHERE numero_matricule = ?
            ORDER BY date_de_demande DESC
            """;
        return  jdbcTemplate.query(sql,this::mapDemandeConge, numeroMatricule);
    }

    public int save(DemandeConge demandeConge) {
        String sql = """
            INSERT INTO demande_conges(
                motif,
                type_conge,
                date_de_debut,
                date_fin,
                numero_matricule ) 
            VALUES (?, ?, ?, ?, ?)  
            """;

        return jdbcTemplate.update(sql,
                demandeConge.getMotif(),
                demandeConge.getTypeConge(),
                Date.valueOf(demandeConge.getDateDeDebut()),
                Date.valueOf(demandeConge.getDateFin()),
                demandeConge.getNumeroMatricule()
                );
    }

}
```

---

## B. Gestion des soldes

### 5. `SoldeConge.java`

```java
package com.project.backend.conge;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public class SoldeConge {

    private Long id;

//    @Positive(message = "Le matricule doit être positif")
    private Long numeroMatricule;

    @Min(value = 1900, message = "L'année minimale est 1900")
    @Max(value = 9999, message = "L'année maximale est 9999")
    private int annee;

    @NotNull(message = "Le solde initial est obligatoire")
    @PositiveOrZero(message = "Le solde initial ne peut pas être négatif")
    private BigDecimal soldeInitial;

//    @NotNull(message = "Les jours acquis sont obligatoires")
    @PositiveOrZero(message = "Les jours acquis ne peuvent pas être négatifs")
    private BigDecimal joursAcquis;

//    @NotNull(message = "Les jours pris sont obligatoires")
    @PositiveOrZero(message = "Les jours pris ne peuvent pas être négatifs")
    private BigDecimal joursPris;

//    @NotNull(message = "Le solde restant est obligatoire")
    @PositiveOrZero(message = "Le solde restant ne peut pas être négatif")
    private BigDecimal soldeRestant;

    public SoldeConge() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getNumeroMatricule() {
        return numeroMatricule;
    }

    public void setNumeroMatricule(Long numeroMatricule) {
        this.numeroMatricule = numeroMatricule;
    }

    public int getAnnee() {
        return annee;
    }

    public void setAnnee(int annee) {
        this.annee = annee;
    }

    public BigDecimal getSoldeInitial() {
        return soldeInitial;
    }

    public void setSoldeInitial(BigDecimal soldeInitial) {
        this.soldeInitial = soldeInitial;
    }

    public BigDecimal getJoursAcquis() {
        return joursAcquis;
    }

    public void setJoursAcquis(BigDecimal joursAcquis) {
        this.joursAcquis = joursAcquis;
    }

    public BigDecimal getJoursPris() {
        return joursPris;
    }

    public void setJoursPris(BigDecimal joursPris) {
        this.joursPris = joursPris;
    }

    public BigDecimal getSoldeRestant() {
        return soldeRestant;
    }

    public void setSoldeRestant(BigDecimal soldeRestant) {
        this.soldeRestant = soldeRestant;
    }
}
```

### 6. `SoldeCongeController.java`

```java
package com.project.backend.conge;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class SoldeCongeController {
    private final SoldeCongeService soldeCongeService;

    public SoldeCongeController(SoldeCongeService soldeCongeService) {
        this.soldeCongeService = soldeCongeService;
    }

    @GetMapping("/soldeConge/{numeroMatricule}")
    public List<SoldeConge> findByNumeroMatricule(@PathVariable long numeroMatricule){
        return soldeCongeService.findSoldeByNumeroMatricule(numeroMatricule);
    }

    @GetMapping("/soldeConge/{numeroMatricule}/{anne}")
    public SoldeConge findByNumeroMatricule(@PathVariable long numeroMatricule, @PathVariable int anne) {
        return soldeCongeService.findByNumeroMatriculeAndAnnee(numeroMatricule,anne);
    }

    @PostMapping("/soldeConge")
    public int save(@Valid @RequestBody SoldeConge soldeConge) {
        return soldeCongeService.save(soldeConge);
    }

    @PutMapping("/soldeConge")
    public int update(@Valid @RequestBody SoldeConge soldeConge) {
        return soldeCongeService.update(soldeConge);
    }
}
```

### 7. `SoldeCongeService.java`

```java
package com.project.backend.conge;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class SoldeCongeService {

    private final SoldeCongeRepository soldeCongeRepository;

    public SoldeCongeService(SoldeCongeRepository soldeCongeRepository) {
        this.soldeCongeRepository = soldeCongeRepository;
    }

    public List<SoldeConge> findSoldeByNumeroMatricule(
            long numeroMatricule) {

        if (numeroMatricule <= 0) {
            throw new IllegalArgumentException("Le numéro de matricule doit être positif.");
        }

        return soldeCongeRepository.findByNumeroMatricule(numeroMatricule);
    }


    public SoldeConge findByNumeroMatriculeAndAnnee(
            long numeroMatricule, int annee) {

        if (numeroMatricule <= 0) {
            throw new IllegalArgumentException(
                    "Le numéro de matricule doit être positif."
            );
        }

        if (annee < 1900 || annee > 9999) {
            throw new IllegalArgumentException(
                    "L'année doit être comprise entre 1900 et 9999."
            );
        }

        return soldeCongeRepository
                .getSoldeByNumeroMatriculeAndAnnee(numeroMatricule, annee)
                .orElseThrow(() -> new SoldeCongeNotFound(numeroMatricule));
    }

    @Transactional
    public int save(SoldeConge soldeConge) {
        if (soldeConge == null) {
            throw new IllegalArgumentException(
                    "Le solde de congé est obligatoire."
            );
        }

        if (soldeCongeRepository.existsByNumeroMatriculeAndAnnee(
                soldeConge.getNumeroMatricule(),
                soldeConge.getAnnee())) {
            throw new IllegalArgumentException(
                    "Un solde existe déjà pour cet employé et cette année."
            );
        }

        calculerSolde(soldeConge);

        return soldeCongeRepository.save(soldeConge);
    }
    @Transactional
    public int update(SoldeConge soldeConge) {

        if (soldeConge == null) {
            throw new IllegalArgumentException(
                    "Le solde de congé est obligatoire."
            );
        }

        calculerSolde(soldeConge);

        int lignesModifiees =
                soldeCongeRepository.update(soldeConge);

        if (lignesModifiees == 0) {
            throw new SoldeCongeNotFound(
                    soldeConge.getNumeroMatricule()
            );
        }

        return lignesModifiees;
    }


    private BigDecimal calculerJoursAcquis(
            LocalDate dateEmbauche, int annee) {

        LocalDate aujourdHui = LocalDate.now();

        if (annee > aujourdHui.getYear()) {
            return BigDecimal.ZERO;
        }

        LocalDate debutAnnee = LocalDate.of(annee, 1, 1);
        LocalDate finAnnee = LocalDate.of(annee, 12, 31);

        if (dateEmbauche.isAfter(finAnnee)) {
            return BigDecimal.ZERO;
        }

        LocalDate dateLimite = finAnnee.isBefore(aujourdHui)
                ? finAnnee
                : aujourdHui.withDayOfMonth(
                1
        ).minusDays(1);

        if (dateLimite.isBefore(debutAnnee)) {
            return BigDecimal.ZERO;
        }

        int moisAcquis = 0;

        LocalDate premierJour = debutAnnee;

        for (int mois = 1; mois <= 12; mois++) {
            YearMonth periode = YearMonth.of(annee, mois);
            LocalDate finMois = periode.atEndOfMonth();

            if (finMois.isAfter(dateLimite)) {
                continue;
            }

            if (!finMois.isBefore(dateEmbauche)
                    && !finMois.isBefore(premierJour)) {
                moisAcquis++;
            }
        }

        return BigDecimal.valueOf(moisAcquis)
                .multiply(new BigDecimal("2.5"));
    }

    private void calculerSolde(SoldeConge soldeConge) {

        LocalDate dateEmbauche = soldeCongeRepository.findDateEmbauche(soldeConge.getNumeroMatricule());

        BigDecimal joursAcquis = calculerJoursAcquis(
                dateEmbauche,
                soldeConge.getAnnee()
        );

        BigDecimal joursPris = soldeCongeRepository.calculerJoursPris(
                        soldeConge.getNumeroMatricule(),
                        soldeConge.getAnnee()
                );

        BigDecimal soldeRestant = soldeConge.getSoldeInitial()
                        .add(joursAcquis)
                        .subtract(joursPris);

        if (soldeRestant.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(
                    "Les jours de congé pris dépassent le solde disponible."
            );
        }

        soldeConge.setJoursAcquis(joursAcquis);
        soldeConge.setJoursPris(joursPris);
        soldeConge.setSoldeRestant(soldeRestant);
    }



}
```

### 8. `SoldeCongeRepository.java`

```java
package com.project.backend.conge;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.sql.Date;
import java.time.LocalDate;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
public class SoldeCongeRepository {
    private final JdbcTemplate jdbcTemplate;

    public SoldeCongeRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public SoldeConge mapSoldeConge(java.sql.ResultSet rs, int nrw) throws SQLException {
        SoldeConge soldeConge = new SoldeConge();

        soldeConge.setId(rs.getLong("id"));
        soldeConge.setNumeroMatricule(rs.getLong("numero_matricule"));
        soldeConge.setAnnee(rs.getInt("annee"));
        soldeConge.setSoldeInitial(rs.getBigDecimal("solde_initial"));
        soldeConge.setJoursAcquis(rs.getBigDecimal("jours_acquis"));
        soldeConge.setJoursPris(rs.getBigDecimal("jours_pris"));
        soldeConge.setSoldeRestant(rs.getBigDecimal("solde_restant"));

        return soldeConge;

    }

    public List<SoldeConge> findByNumeroMatricule(long numeroMatricule) {
        String sql = """
            SELECT id, numero_matricule, annee,
                   solde_initial, jours_acquis,
                   jours_pris, solde_restant
            FROM solde_conges
            WHERE numero_matricule = ?
            ORDER BY annee DESC
            """;

        return jdbcTemplate.query(
                sql, this::mapSoldeConge, numeroMatricule
        );
    }

    public Optional<SoldeConge> getSoldeByNumeroMatriculeAndAnnee(long numeroMatricule, int annee) {
        String sql = """
                SELECT  
                        id,
                        numero_matricule,
                        annee,
                        solde_initial,
                        jours_acquis, 
                        jours_pris,  
                        solde_restant
                FROM    solde_conges
                WHERE   numero_matricule = ? AND annee = ?
               """;
        List<SoldeConge> resultat =  jdbcTemplate.query(sql, this::mapSoldeConge, numeroMatricule,annee);

        return resultat.stream().findFirst();
    }


    public boolean existsByNumeroMatriculeAndAnnee(
            long numeroMatricule, int annee) {

        String sql = """
        SELECT COUNT(*)
        FROM solde_conges
        WHERE numero_matricule = ?
          AND annee = ?
        """;

        Integer count = jdbcTemplate.queryForObject(
                sql, Integer.class, numeroMatricule, annee
        );

        return count != null && count > 0;
    }


    public int save(SoldeConge soldeConge) {
        String sql = """
        INSERT INTO solde_conges (
            numero_matricule,
            annee,
            solde_initial,
            jours_acquis,
            jours_pris,
            solde_restant
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """;

        return jdbcTemplate.update(
                sql,
                soldeConge.getNumeroMatricule(),
                soldeConge.getAnnee(),
                soldeConge.getSoldeInitial(),
                soldeConge.getJoursAcquis(),
                soldeConge.getJoursPris(),
                soldeConge.getSoldeRestant()
        );
    }

    public int update(SoldeConge soldeConge) {
        String sql = """
            UPDATE solde_conges
            SET
                numsero_matricule = ?,
                solde_initial = ?,
                jours_acquis = ?,
                jours_pris = ?,
                solde_restant = ?
            WHERE numero_matricule = ?
              AND annee = ?
            """;

        return jdbcTemplate.update(
                sql,
                soldeConge.getNumeroMatricule(),
                soldeConge.getSoldeInitial(),
                soldeConge.getJoursAcquis(),
                soldeConge.getJoursPris(),
                soldeConge.getSoldeRestant(),
                soldeConge.getNumeroMatricule(),
                soldeConge.getAnnee()
        );
    }

    public LocalDate findDateEmbauche(long numeroMatricule) {
        String sql = """
        SELECT date_embauche
        FROM employe
        WHERE numero_matricule = ?
        """;

        List<Date> dates = jdbcTemplate.query(
                sql,
                (rs, rowNum) -> rs.getDate("date_embauche"),
                numeroMatricule
        );

        if (dates.isEmpty()) {
            throw new IllegalArgumentException(
                    "Aucun employé trouvé pour le matricule : "
                            + numeroMatricule
            );
        }

        Date date = dates.get(0);

        if (date == null) {
            throw new IllegalArgumentException(
                    "La date d'embauche est absente pour le matricule : "
                            + numeroMatricule
            );
        }

        return date.toLocalDate();
    }    public java.math.BigDecimal calculerJoursPris(long numeroMatricule, int annee) {

        LocalDate debutAnnee = LocalDate.of(annee, 1, 1);
        LocalDate finAnnee = LocalDate.of(annee, 12, 31);

        String sql = """
        SELECT NVL(
            SUM( LEAST(date_fin, ?) - GREATEST(date_de_debut, ?) + 1),
            0
        )
        FROM demande_conges
        WHERE numero_matricule = ?
          AND status = 'ACCEPTER'
          AND type_conge = 'CONGE_PAYE'
          AND date_de_debut <= ?
          AND date_fin >= ?
        """;

        return jdbcTemplate.queryForObject(
                sql,
                java.math.BigDecimal.class,
                Date.valueOf(finAnnee),
                Date.valueOf(debutAnnee),
                numeroMatricule,
                Date.valueOf(finAnnee),
                Date.valueOf(debutAnnee)
        );
    }

}
```
