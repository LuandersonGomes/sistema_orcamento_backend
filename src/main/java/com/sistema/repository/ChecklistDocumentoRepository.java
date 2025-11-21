package com.sistema.repository;

import com.sistema.model.ChecklistDocumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChecklistDocumentoRepository extends JpaRepository<ChecklistDocumento, Long> {

    Optional<ChecklistDocumento> findByServicoId(Long servicoId);
    List<ChecklistDocumento> findBySecretariaId(Long secretariaId);
    boolean existsByServicoId(Long servicoId);
}