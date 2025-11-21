package com.sistema.controller;

import com.sistema.model.DocumentoAuxiliar;
import com.sistema.repository.DocumentoAuxiliarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/documentos-auxiliares")
@CrossOrigin(origins = "*")
public class DocumentoAuxiliarController {
    
    @Autowired
    private DocumentoAuxiliarRepository repository;
    
    @GetMapping
    public List<DocumentoAuxiliar> listar() {
        return repository.findAll();
    }
    
    @GetMapping("/{id}")
    public DocumentoAuxiliar buscarPorId(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }
    
    @GetMapping("/orcamento/{orcamentoId}")
    public List<DocumentoAuxiliar> buscarPorOrcamento(@PathVariable Long orcamentoId) {
        return repository.findByOrcamentoId(orcamentoId);
    }
    
    @GetMapping("/orcamento/{orcamentoId}/secretaria/{secretariaId}")
    public DocumentoAuxiliar buscarPorOrcamentoESecretaria(
            @PathVariable Long orcamentoId, 
            @PathVariable Long secretariaId) {
        return repository.findByOrcamentoIdAndSecretariaId(orcamentoId, secretariaId).orElse(null);
    }
    
    @PostMapping
    public DocumentoAuxiliar criar(@RequestBody DocumentoAuxiliar documentoAuxiliar) {
        return repository.save(documentoAuxiliar);
    }
    
    @PutMapping("/{id}")
    public DocumentoAuxiliar atualizar(@PathVariable Long id, @RequestBody DocumentoAuxiliar documentoAuxiliar) {
        documentoAuxiliar.setId(id);
        return repository.save(documentoAuxiliar);
    }
    
    @PutMapping("/orcamento/{orcamentoId}/secretaria/{secretariaId}")
    public DocumentoAuxiliar atualizarPorOrcamentoESecretaria(
            @PathVariable Long orcamentoId,
            @PathVariable Long secretariaId,
            @RequestBody DocumentoAuxiliar documentoAuxiliar) {
        
        Optional<DocumentoAuxiliar> existente = repository.findByOrcamentoIdAndSecretariaId(orcamentoId, secretariaId);
        
        if (existente.isPresent()) {
            DocumentoAuxiliar doc = existente.get();
            doc.setBoleto(documentoAuxiliar.getBoleto());
            doc.setLicencaFinal(documentoAuxiliar.getLicencaFinal());
            doc.setNc(documentoAuxiliar.getNc());
            doc.setCampo4p(documentoAuxiliar.getCampo4p());
            return repository.save(doc);
        } else {
            documentoAuxiliar.setId(null);
            return repository.save(documentoAuxiliar);
        }
    }
    
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        repository.deleteById(id);
    }
}