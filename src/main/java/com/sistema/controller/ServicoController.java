package com.sistema.controller;

import com.sistema.model.Servico;
import com.sistema.repository.ServicoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/servicos")
@CrossOrigin(origins = "*")
public class ServicoController {
    
    @Autowired
    private ServicoRepository repository;
    
    @GetMapping
    public List<Servico> listar() {
        return repository.findAll();
    }
    
    @GetMapping("/{id}")
    public Servico buscarPorId(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }
    
    @GetMapping("/secretaria/{secretariaId}")
    public List<Servico> buscarPorSecretaria(@PathVariable Long secretariaId) {
        return repository.findBySecretariaId(secretariaId);
    }
    
    @PostMapping
    public Servico criar(@RequestBody Servico servico) {
        return repository.save(servico);
    }
    
    @PutMapping("/{id}")
    public Servico atualizar(@PathVariable Long id, @RequestBody Servico servico) {
        servico.setId(id);
        return repository.save(servico);
    }
    
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        repository.deleteById(id);
    }
}