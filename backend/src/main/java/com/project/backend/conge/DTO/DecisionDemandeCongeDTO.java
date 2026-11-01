package com.project.backend.conge.DTO;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DecisionDemandeCongeDTO(

        @NotBlank(message = "Le motif de refus est obligatoire.")
        @Size(max = 255, message = "Le motif ne doit pas dépasser 255 caractères.")
        String motifRefus

) {
}
