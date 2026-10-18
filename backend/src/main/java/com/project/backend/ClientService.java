package com.project.backend;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class ClientService {
    private final ClientRepository clientRepository;
    private final List<Client> clientsList = new ArrayList<>();

    public ClientService(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    public List<Client> getClient() {
        return clientRepository.findAll();
    }

    public Client ajouterClient(Client client) {
        return clientRepository.ajoutClient(
                client.getId(),
                client.getNom(),
                client.getTelephone()
        );
    }

    public Client getClientById(long id) {
        return clientRepository.getClientById(id);
    }

    public Client modifClient(long id, String nom, String telephone) {
        return clientRepository.modifierClient(id, nom, telephone);
    }

    public void deleteClient(long id) {
        clientRepository.deleteClient(id);
    }
}
