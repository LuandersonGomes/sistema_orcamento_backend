package com.sistema.controller;

import com.sistema.model.ChecklistDocumento;
import com.sistema.repository.ChecklistDocumentoRepository;
import com.sistema.repository.SecretariaRepository;
import com.sistema.repository.ServicoRepository;
import com.sistema.repository.TipoDocumentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/checklist")
@CrossOrigin(origins = "*")
public class ChecklistDocumentoController {

    @Autowired
    private ChecklistDocumentoRepository checklistRepository;

    @Autowired
    private SecretariaRepository secretariaRepository;

    @Autowired
    private ServicoRepository servicoRepository;

    @Autowired
    private TipoDocumentoRepository tipoDocumentoRepository;

    // GET ALL - Para carregar a lista
    @GetMapping
    public ResponseEntity<List<ChecklistDocumento>> getAllChecklists() {
        try {
            List<ChecklistDocumento> checklists = checklistRepository.findAll();
            return ResponseEntity.ok(checklists);
        } catch (Exception e) {
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    // GET BY ID - Para editar
    @GetMapping("/{id}")
    public ResponseEntity<ChecklistDocumento> getChecklistById(@PathVariable Long id) {
        try {
            Optional<ChecklistDocumento> checklist = checklistRepository.findById(id);
            return checklist.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // CREATE - Para salvar novo
    @PostMapping
    public ResponseEntity<?> createChecklist(@RequestBody ChecklistDocumento checklist) {
        try {
            ChecklistDocumento savedChecklist = checklistRepository.save(checklist);
            return ResponseEntity.ok(savedChecklist);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao criar checklist: " + e.getMessage());
        }
    }

    // UPDATE - Para editar existente
    @PutMapping("/{id}")
    public ResponseEntity<?> updateChecklist(@PathVariable Long id, @RequestBody ChecklistDocumento checklist) {
        try {
            if (!checklistRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            checklist.setId(id);
            ChecklistDocumento updatedChecklist = checklistRepository.save(checklist);
            return ResponseEntity.ok(updatedChecklist);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao atualizar checklist: " + e.getMessage());
        }
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteChecklist(@PathVariable Long id) {
        try {
            if (!checklistRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            checklistRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao excluir checklist: " + e.getMessage());
        }
    }

    // GET POR SERVIÇO - Para a tela de orçamentos
    @GetMapping("/servico/{servicoId}")
    public ResponseEntity<?> getChecklistPorServico(@PathVariable Long servicoId) {
        try {
            // Busca o checklist pelo serviço
            Optional<ChecklistDocumento> checklist = checklistRepository.findByServicoId(servicoId);
            if (checklist.isPresent()) {
                return ResponseEntity.ok(checklist.get());
            } else {
                // Se não encontrar, retorna um checklist vazio
                Map<String, Object> response = new HashMap<>();
                response.put("tiposDocumentos", Collections.emptyList());
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("tiposDocumentos", Collections.emptyList());
            return ResponseEntity.ok(errorResponse);
        }
    }
}