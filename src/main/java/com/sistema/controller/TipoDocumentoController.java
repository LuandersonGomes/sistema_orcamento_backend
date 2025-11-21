package com.sistema.controller;

import com.sistema.model.TipoDocumento;
import com.sistema.repository.TipoDocumentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipos-documento")
@CrossOrigin(origins = "*")
public class TipoDocumentoController {
    
    @Autowired
    private TipoDocumentoRepository repository;
    
    @GetMapping
    public List<TipoDocumento> listar() {
        return repository.findAll();
    }
    
    @GetMapping("/{id}")
    public TipoDocumento buscarPorId(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }
    
    @PostMapping
    public TipoDocumento criar(@RequestBody TipoDocumento tipoDocumento) {
        return repository.save(tipoDocumento);
    }
    
    @PutMapping("/{id}")
    public TipoDocumento atualizar(@PathVariable Long id, @RequestBody TipoDocumento tipoDocumento) {
        tipoDocumento.setId(id);
        return repository.save(tipoDocumento);
    }
    
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        repository.deleteById(id);
    }
}