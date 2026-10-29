
package com.project.backend.auth;

import com.project.backend.auth.dto.LoginResponse;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthService {

    private final AuthRepository authRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(AuthRepository authRepository) {
        this.authRepository = authRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public LoginResponse connecter(String login, String motDePasse) {

        // 1. Vérifier que les champs sont renseignés
        if (login == null || login.isBlank()
                || motDePasse == null || motDePasse.isBlank()) {
            throw new IllegalArgumentException(
                    "Le login et le mot de passe sont obligatoires."
            );
        }

        // 2. Rechercher le compte dans Oracle
        Map<String, Object> utilisateur =
                authRepository.trouverParLogin(login.trim());

        if (utilisateur == null) {
            throw new IllegalArgumentException(
                    "Login ou mot de passe incorrect."
            );
        }

        // 3. Vérifier si le compte est actif
        Number actif = (Number) utilisateur.get("ACTIF");

        if (actif == null || actif.intValue() != 1) {
            throw new IllegalArgumentException(
                    "Ce compte est désactivé."
            );
        }

        // 4. Vérifier le mot de passe avec BCrypt
        String hash = (String) utilisateur.get("MOT_DE_PASS");

        if (hash == null || !passwordEncoder.matches(motDePasse, hash)) {
            throw new IllegalArgumentException(
                    "Login ou mot de passe incorrect."
            );
        }

        // 5. Construire la réponse sans exposer le hash
        Number id = (Number) utilisateur.get("ID");
        Number matricule =
                (Number) utilisateur.get("NUMERO_MATRICULE");

        return new LoginResponse(
                id.longValue(),
                (String) utilisateur.get("LOGIN"),
                matricule.longValue(),
                (String) utilisateur.get("NOM_ET_PRENOMS"),
                (String) utilisateur.get("ROLE")
        );
    }
}
