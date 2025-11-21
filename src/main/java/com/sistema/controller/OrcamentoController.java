package com.sistema.controller;

import com.sistema.model.Orcamento;
import com.sistema.repository.OrcamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orcamentos")
@CrossOrigin(origins = "*")
public class OrcamentoController {
    
    @Autowired
    private OrcamentoRepository repository;
    
    @GetMapping
    public List<Orcamento> listar() {
        return repository.findAll();
    }
    
    @GetMapping("/{id}")
    public Orcamento buscarPorId(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }
    
    @PostMapping
    public Orcamento criar(@RequestBody Orcamento orcamento) {
        return repository.save(orcamento);
    }
    
    @PutMapping("/{id}")
    public Orcamento atualizar(@PathVariable Long id, @RequestBody Orcamento orcamento) {
        orcamento.setId(id);
        return repository.save(orcamento);
    }
    
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        repository.deleteById(id);
    }
}