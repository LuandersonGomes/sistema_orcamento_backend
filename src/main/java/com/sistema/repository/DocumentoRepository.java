package com.sistema.repository;

import com.sistema.model.Documento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentoRepository extends JpaRepository<Documento, Long> {

    // Busca documentos por orçamento
    List<Documento> findByOrcamentoId(Long orcamentoId);

    // Busca documentos por orçamento e tipo
    List<Documento> findByOrcamentoIdAndTipoId(Long orcamentoId, Long tipoId);
}