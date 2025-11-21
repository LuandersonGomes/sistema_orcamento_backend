package com.sistema.controller;

import com.sistema.model.Secretaria;
import com.sistema.repository.SecretariaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/secretarias")
@CrossOrigin(origins = "*")
public class SecretariaController {
    
    @Autowired
    private SecretariaRepository repository;
    
    @GetMapping
    public List<Secretaria> listar() {
        return repository.findAll();
    }
    
    @GetMapping("/{id}")
    public Secretaria buscarPorId(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }
    
    @PostMapping
    public Secretaria criar(@RequestBody Secretaria secretaria) {
        return repository.save(secretaria);
    }
    
    @PutMapping("/{id}")
    public Secretaria atualizar(@PathVariable Long id, @RequestBody Secretaria secretaria) {
        secretaria.setId(id);
        return repository.save(secretaria);
    }
    
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        repository.deleteById(id);
    }
}