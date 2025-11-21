package com.sistema.controller;

import com.sistema.model.Imovel;
import com.sistema.repository.ImovelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/imoveis")
@CrossOrigin(origins = "*")
public class ImovelController {
    
    @Autowired
    private ImovelRepository repository;
    
    @GetMapping
    public List<Imovel> listar() {
        return repository.findAll();
    }
    
    @GetMapping("/{id}")
    public Imovel buscarPorId(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }
    
    @PostMapping
    public Imovel criar(@RequestBody Imovel imovel) {
        return repository.save(imovel);
    }
    
    @PutMapping("/{id}")
    public Imovel atualizar(@PathVariable Long id, @RequestBody Imovel imovel) {
        imovel.setId(id);
        return repository.save(imovel);
    }
    
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        repository.deleteById(id);
    }
}