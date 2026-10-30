
package com.project.backend.outils;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {

    public static void main(String[] args) {

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        String motDePasse = "chatonnofy";

        String hash = encoder.encode(motDePasse);

        System.out.println("Hash BCrypt : " + hash);
        System.out.println("Longueur : " + hash.length());
        System.out.println("Vérification : " + encoder.matches(motDePasse, hash));
    }
}
