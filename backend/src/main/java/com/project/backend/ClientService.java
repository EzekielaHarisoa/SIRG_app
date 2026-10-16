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
    private final List<Client> clientsList = new ArrayList<>();

    public List<Client> getClient() {
        return clientsList;
    }

    public Client ajouterClient(Client client) {
        client.setId((long) clientsList.size()+1);
        clientsList.add(client);
        return client;
    }

    public Client getClientById(long id) {
        return clientsList.stream()
                .filter(cl -> cl.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "client not found")
                );
    }

    public Client modifClient(long id, Client client) {
        Client clientExiste = getClientById(id);
        clientExiste.setNom(client.getNom());
        clientExiste.setTelephone(client.getTelephone());
        return clientExiste;
    }

    public void deleteClient(long id) {
        Client client = getClientById(id);
        clientsList.remove(client);
    }
}
