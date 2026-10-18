package com.project.backend;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @GetMapping("/client")
    public List<Client> getClient(){
        return clientService.getClient();
    }

    @PostMapping("/client")
    public Client ajouterClient(@RequestBody Client client) {
        return clientService.ajouterClient(client);
    }

    @GetMapping("/client/{id}")
    public Client getClientById(@PathVariable Long id) {
        return clientService.getClientById(id);
    }

    @PutMapping("/client/{id}")
    public Client modifierClient(@PathVariable Long id, @RequestBody Client clientModifier) {
        return clientService.modifClient(
                id,
                clientModifier.getNom(),
                clientModifier.getTelephone()
        );
    }

    @DeleteMapping("/client/{id}")
    public void deletClient(@PathVariable Long id) {
        clientService.deleteClient(id);
        System.out.println("suppression de client reussi ");
    }

}
