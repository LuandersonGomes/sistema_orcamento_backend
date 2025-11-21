package com.sistema.controller;

import com.sistema.model.PessoaJuridica;
import com.sistema.repository.PessoaJuridicaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pessoas-juridicas")
@CrossOrigin(origins = "*")
public class PessoaJuridicaController {
    
    @Autowired
    private PessoaJuridicaRepository repository;
    
    @GetMapping
    public List<PessoaJuridica> listar() {
        return repository.findAll();
    }
    
    @GetMapping("/{id}")
    public PessoaJuridica buscarPorId(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }
    
    @PostMapping
    public PessoaJuridica criar(@RequestBody PessoaJuridica pessoa) {
        return repository.save(pessoa);
    }
    
    @PutMapping("/{id}")
    public PessoaJuridica atualizar(@PathVariable Long id, @RequestBody PessoaJuridica pessoa) {
        pessoa.setId(id);
        return repository.save(pessoa);
    }
    
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        repository.deleteById(id);
    }
}