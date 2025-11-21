package com.sistema.controller;

import com.sistema.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {
    
    @Autowired
    private PessoaFisicaRepository pessoaFisicaRepository;
    
    @Autowired
    private PessoaJuridicaRepository pessoaJuridicaRepository;
    
    @Autowired
    private ImovelRepository imovelRepository;
    
    @Autowired
    private OrcamentoRepository orcamentoRepository;
    
    @Autowired
    private ServicoRepository servicoRepository;
    
    @GetMapping("/contadores")
    public Map<String, Long> getContadores() {
        Map<String, Long> contadores = new HashMap<>();
        contadores.put("pessoasFisicas", pessoaFisicaRepository.count());
        contadores.put("pessoasJuridicas", pessoaJuridicaRepository.count());
        contadores.put("imoveis", imovelRepository.count());
        contadores.put("orcamentos", orcamentoRepository.count());
        contadores.put("servicos", servicoRepository.count());
        return contadores;
    }
}