package com.sistema.repository;

import com.sistema.model.DocumentoAuxiliar;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DocumentoAuxiliarRepository extends JpaRepository<DocumentoAuxiliar, Long> {

    List<DocumentoAuxiliar> findByOrcamentoId(Long orcamentoId);

    Optional<DocumentoAuxiliar> findByOrcamentoIdAndSecretariaId(Long orcamentoId, Long secretariaId);

  }