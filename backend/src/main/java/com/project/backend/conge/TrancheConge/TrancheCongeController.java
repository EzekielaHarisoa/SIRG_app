package com.project.backend.conge.TrancheConge;

import com.project.backend.conge.soldeConge.SoldeCongeDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tranches-conge")
public class TrancheCongeController {

    private final TrancheCongeService trancheCongeService;

    public TrancheCongeController(TrancheCongeService trancheCongeService) {
        this.trancheCongeService = trancheCongeService;
    }

    @PostMapping("/initialiser/{numeroMatricule}")
    public ResponseEntity<Void> initialiserTranches(@PathVariable long numeroMatricule) {

        trancheCongeService.initialiserTranches(numeroMatricule);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/employe/{numeroMatricule}")
    public ResponseEntity<List<TrancheCongeSoldeDTO>> consulterTranches(@PathVariable long numeroMatricule) {

        return ResponseEntity.ok(
                trancheCongeService.consulterTranches(numeroMatricule)
        );
    }

    @GetMapping("/solde/{numeroMatricule}")
    public ResponseEntity<SoldeCongeDTO> calculerSoldeGlobal(@PathVariable long numeroMatricule) {
        return ResponseEntity.ok(
                trancheCongeService.calculerSoldeGlobal(numeroMatricule)
        );
    }

}