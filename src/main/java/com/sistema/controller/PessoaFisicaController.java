package com.sistema.controller;

import com.sistema.model.PessoaFisica;
import com.sistema.repository.PessoaFisicaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pessoas-fisicas")
@CrossOrigin(origins = "*")
public class PessoaFisicaController {
    
    @Autowired
    private PessoaFisicaRepository repository;
    
    @GetMapping
    public List<PessoaFisica> listar() {
        return repository.findAll();
    }
    
    @PostMapping
    public PessoaFisica criar(@RequestBody PessoaFisica pessoa) {
        return repository.save(pessoa);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PessoaFisica> buscarPorId(@PathVariable Long id) {
        Optional<PessoaFisica> pessoa = repository.findById(id);
        return pessoa.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<PessoaFisica> atualizar(@PathVariable Long id, @RequestBody PessoaFisica pessoa) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        pessoa.setId(id);
        PessoaFisica atualizada = repository.save(pessoa);
        return ResponseEntity.ok(atualizada);
    }
    
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        repository.deleteById(id);
    }
}