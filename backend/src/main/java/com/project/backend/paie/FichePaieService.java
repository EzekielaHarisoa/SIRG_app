package com.project.backend.paie;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class FichePaieService {

    private final JdbcTemplate jdbc;
    private final BulletinPaieRepository bulletinRepository;
    private final CotisationReglementRepository cotisationRepo;
    private final LigneCotisationRepository ligneRepo;

    public FichePaieService(JdbcTemplate jdbc,
                             BulletinPaieRepository bulletinRepository,
                             CotisationReglementRepository cotisationRepo,
                             LigneCotisationRepository ligneRepo) {
        this.jdbc = jdbc;
        this.bulletinRepository = bulletinRepository;
        this.cotisationRepo = cotisationRepo;
        this.ligneRepo = ligneRepo;
    }

    @Transactional(readOnly = true)
    public FichePaie generer(long bulletinId) {
        BulletinPaie bulletin = bulletinRepository.findById(bulletinId);
        if (bulletin == null) {
            throw new BulletinPaieNotFoundException(bulletinId);
        }

        FichePaie fiche = new FichePaie();
        fiche.setEntreprise(chargerEntreprise(bulletin.getNumeroMatricule()));

        EmployeFiche emp = chargerEmploye(bulletin.getNumeroMatricule());
        fiche.setEmploye(emp);

        fiche.setPeriode(construirePeriode(bulletin.getDateEmission()));

        BigDecimal salaireBrut = bulletin.getSalaireBrute() != null
                ? bulletin.getSalaireBrute()
                : BulletinPaieServiceCalcul.salaireBrut(bulletin.getSalaireDeBase(),
                bulletin.getHeurTravaille(), bulletin.getTotalPrime());
        fiche.setSalaireBrut(salaireBrut);

        // Les rubriques et les totaux sont toujours recalculés depuis le référentiel
        // de cotisations : la fiche reste ainsi cohérente avec les taux en vigueur.
        List<LigneCotisationDto> lignes = construireLignes(bulletinId, salaireBrut);

        BigDecimal totalSalariales = BigDecimal.ZERO;
        BigDecimal totalPatronales = BigDecimal.ZERO;
        for (LigneCotisationDto l : lignes) {
            if (l.isEstSection()) {
                continue; // lignes de total : sommerait deux fois
            }
            if (l.getCotisationSalariale() != null) {
                totalSalariales = totalSalariales.add(l.getCotisationSalariale());
            }
            if (l.getCotisationPatronale() != null) {
                totalPatronales = totalPatronales.add(l.getCotisationPatronale());
            }
        }

        fiche.setTotalCotisationsSalariales(totalSalariales);
        fiche.setTotalCotisationsPatronales(totalPatronales);
        fiche.setChargePatronale(totalPatronales);
        fiche.setSalaireNet(salaireBrut.subtract(totalSalariales));
        fiche.setCoutGlobal(salaireBrut.add(totalPatronales));
        fiche.setLignes(lignes);

        return fiche;
    }

    private EntrepriseUsine chargerEntreprise(Long matricule) {
        String sql = """
            SELECT e.nom,
                   NVL(e.adresse_complete, e.adresse) AS adresse,
                   e.siret,
                   e.code_naf,
                   e.matricule_urssaf,
                   e.convention
            FROM employe em
            JOIN entreprise e ON e.id = em.entreprise_id
            WHERE em.numero_matricule = ?
            """;
        List<Map<String, Object>> rows = jdbc.queryForList(sql, matricule);
        if (rows.isEmpty()) {
            EntrepriseUsine e = new EntrepriseUsine();
            e.setNom("Entreprise non trouvée");
            return e;
        }
        Map<String, Object> r = rows.get(0);
        EntrepriseUsine entreprise = new EntrepriseUsine();
        entreprise.setNom(rs(r, "nom"));
        entreprise.setAdresse(rs(r, "adresse"));
        entreprise.setSiret(rs(r, "siret"));
        entreprise.setCodeNaf(rs(r, "code_naf"));
        entreprise.setMatriculeUrssaf(rs(r, "matricule_urssaf"));
        entreprise.setConvention(rs(r, "convention"));
        return entreprise;
    }

    private EmployeFiche chargerEmploye(Long matricule) {
        String sql = """
            SELECT em.numero_matricule,
                   em.nom_et_prenoms,
                   NVL(em.numero_securite_sociale, ' ') AS numero_securite_sociale,
                   em.date_embauche,
                   NVL(em.emploi, ps.titre) AS emploi,
                   NVL(ps.qualification, 'Non Cadre') AS qualification,
                   NVL(ps.coefficient, 100) AS coefficient,
                   NVL(em.type_contrat, 'CDI') AS type_contrat,
                   em.adresse
            FROM employe em
            JOIN poste ps ON ps.id = em.poste_id
            WHERE em.numero_matricule = ?
            """;
        List<Map<String, Object>> rows = jdbc.queryForList(sql, matricule);
        EmployeFiche emp = new EmployeFiche();
        if (rows.isEmpty()) {
            emp.setNomComplet("Employé non trouvé");
            return emp;
        }
        Map<String, Object> r = rows.get(0);
        emp.setMatricule(rsLong(r, "numero_matricule"));
        emp.setNumeroSecuriteSociale(rs(r, "numero_securite_sociale"));
        emp.setEntreeLe(rsDate(r, "date_embauche"));
        emp.setNomComplet(rs(r, "nom_et_prenoms"));
        emp.setEmploi(rs(r, "emploi"));
        emp.setQualification(rs(r, "qualification"));
        emp.setCoefficient(rsBD(r, "coefficient"));
        emp.setTypeContrat(rs(r, "type_contrat"));
        emp.setAdresse(rs(r, "adresse"));
        if (emp.getPlafondSecuriteSociale() == null) {
            emp.setPlafondSecuriteSociale(new BigDecimal("3311.00"));
        }
        return emp;
    }

    private PeriodePaie construirePeriode(java.time.LocalDate dateEmission) {
        PeriodePaie periode = new PeriodePaie();
        if (dateEmission == null) {
            dateEmission = java.time.LocalDate.now();
        }
        // La période couvre le mois du bulletin, le paiement a lieu à la date d'émission.
        LocalDate debut = dateEmission.withDayOfMonth(1);
        LocalDate fin = debut.plusMonths(1).minusDays(1);
        periode.setDebut(debut);
        periode.setFin(fin);
        periode.setPaiementLe(dateEmission);
        return periode;
    }

    private List<LigneCotisationDto> construireLignes(long bulletinId, BigDecimal salaireBrut) {
        List<CotisationReglement> refs = cotisationRepo.findAll();
        List<LigneCotisationDto> lignes = new ArrayList<>();
        BigDecimal totalSalariales = BigDecimal.ZERO;
        BigDecimal totalPatronales = BigDecimal.ZERO;

        // On calcule les lignes détaillées selon la référence et le type de base
        for (CotisationReglement c : refs) {
            LigneCotisationDto dto = new LigneCotisationDto();
            dto.setFamille(c.getFamille());
            dto.setLibelle(c.getLibelle());
            dto.setEstSection(c.getTypeBase().equals("SECTION"));
            dto.setEstSousSection(false);
            dto.setEstDetail(!c.getTypeBase().equals("SECTION"));

            if (c.getTypeBase().equals("SECTION")) {
                dto.setBase(null);
                dto.setTauxSalarial(null);
                dto.setCotisationSalariale(null);
                dto.setTauxPatronal(null);
                dto.setCotisationPatronale(null);
            } else {
                BigDecimal base = calculerBase(c, salaireBrut);
                dto.setBase(base);

                if (c.isEstSalariale() && c.getTauxSalarial() != null) {
                    BigDecimal cotise = base.multiply(c.getTauxSalarial()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_EVEN);
                    dto.setTauxSalarial(c.getTauxSalarial());
                    dto.setCotisationSalariale(cotise);
                    totalSalariales = totalSalariales.add(cotise);
                } else {
                    dto.setTauxSalarial(null);
                    dto.setCotisationSalariale(null);
                }

                if ("MONTANT".equals(c.getTypeBase()) && c.getTauxPatronal() != null) {
                    // Montant patronal fixe en euros (ex : autres contributions employeur)
                    dto.setTauxPatronal(null);
                    dto.setCotisationPatronale(c.getTauxPatronal());
                    totalPatronales = totalPatronales.add(c.getTauxPatronal());
                } else if (c.getTauxPatronal() != null) {
                    BigDecimal cotise = base.multiply(c.getTauxPatronal()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_EVEN);
                    dto.setTauxPatronal(c.getTauxPatronal());
                    dto.setCotisationPatronale(cotise);
                    totalPatronales = totalPatronales.add(cotise);
                } else {
                    dto.setTauxPatronal(null);
                    dto.setCotisationPatronale(null);
                }
            }
            lignes.add(dto);
        }

        // Ajout des totaux généraux en fin de tableau
        lignes.add(finencerLigneTotale("TOTAL", "TOTAL COTISATIONS SALARIALES", null, totalSalariales, null, null, true));
        lignes.add(finencerLigneTotale("TOTAL", "TOTAL COTISATIONS PATRONALES", null, null, null, totalPatronales, true));

        return lignes;
    }

    private BigDecimal calculerBase(CotisationReglement c, BigDecimal salaireBrut) {
        if ("SECTION".equals(c.getTypeBase()) || "MONTANT".equals(c.getTypeBase())) {
            return salaireBrut;
        }
        if ("SBC_PLAFONNE".equals(c.getTypeBase())) {
            // CSG deductible : base = salaireBrut * 0.9825
            return salaireBrut.multiply(BigDecimal.valueOf(0.9825)).setScale(2, RoundingMode.HALF_EVEN);
        }
        // SBC (salaire brut de base) = salaireBrut
        return salaireBrut;
    }

    private LigneCotisationDto finencerLigneTotale(String famille, String libelle, BigDecimal base, BigDecimal salariale, BigDecimal tauxPatronal, BigDecimal patronale, boolean estTotal) {
        LigneCotisationDto dto = new LigneCotisationDto();
        dto.setFamille(famille);
        dto.setLibelle(libelle);
        dto.setBase(base);
        dto.setTauxSalarial(null);
        dto.setCotisationSalariale(salariale);
        dto.setTauxPatronal(tauxPatronal);
        dto.setCotisationPatronale(patronale);
        dto.setEstSection(true);
        dto.setEstSousSection(false);
        dto.setEstDetail(false);
        return dto;
    }

    // utilitaires de lecture sans risque
    private String rs(Map<String, Object> r, String key) {
        Object v = r.get(key);
        if (v == null) return null;
        if (v instanceof java.sql.Date) {
            return ((java.sql.Date) v).toLocalDate() != null ? ((java.sql.Date) v).toLocalDate().toString() : null;
        }
        return v.toString();
    }

    private Long rsLong(Map<String, Object> r, String key) {
        Object v = r.get(key);
        if (v == null) return null;
        if (v instanceof Number) {
            return ((Number) v).longValue();
        }
        try {
            return Long.parseLong(v.toString());
        } catch (Exception e) {
            return null;
        }
    }

    private java.time.LocalDate rsDate(Map<String, Object> r, String key) {
        Object v = r.get(key);
        if (v == null) return null;
        if (v instanceof java.sql.Date d) {
            return d.toLocalDate();
        }
        if (v instanceof java.sql.Timestamp ts) {
            return ts.toLocalDateTime().toLocalDate();
        }
        if (v instanceof java.time.LocalDate ld) {
            return ld;
        }
        if (v instanceof java.time.LocalDateTime ldt) {
            return ldt.toLocalDate();
        }
        String s = v.toString();
        try {
            return java.time.LocalDate.parse(s);
        } catch (Exception ignored) {
            // Oracle renvoie parfois "2017-03-20 00:00:00.0"
        }
        try {
            return java.time.LocalDate.parse(s.substring(0, 10));
        } catch (Exception e) {
            return null;
        }
    }

    private BigDecimal rsBD(Map<String, Object> r, String key) {
        Object v = r.get(key);
        if (v == null) return null;
        if (v instanceof BigDecimal) {
            return (BigDecimal) v;
        }
        if (v instanceof Number) {
            return BigDecimal.valueOf(((Number) v).doubleValue());
        }
        try {
            return new BigDecimal(v.toString());
        } catch (Exception e) {
            return null;
        }
    }

    // Utiliser le JdbcTemplate du bulletinRepository (partagé)
    static class BulletinPaieServiceCalcul {
        public static BigDecimal salaireBrut(BigDecimal salaireDeBase, BigDecimal heures, BigDecimal totalPrime) {
            if (salaireDeBase == null) salaireDeBase = BigDecimal.ZERO;
            if (heures == null) heures = BigDecimal.ZERO;
            if (totalPrime == null) totalPrime = BigDecimal.ZERO;
            return salaireDeBase.add(heures).add(totalPrime);
        }

        public static BigDecimal salaireNet(BigDecimal salaireDeBase, BigDecimal heures, BigDecimal totalPrime) {
            BigDecimal brut = salaireBrut(salaireDeBase, heures, totalPrime);
            BigDecimal charges = brut.multiply(BigDecimal.valueOf(0.02)); // 2% charges salariales simples
            return brut.subtract(charges);
        }
    }
}
