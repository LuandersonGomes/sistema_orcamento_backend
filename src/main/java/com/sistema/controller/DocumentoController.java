package com.sistema.controller;

import com.sistema.model.Documento;
import com.sistema.model.Orcamento;
import com.sistema.model.TipoDocumento;
import com.sistema.repository.DocumentoRepository;
import com.sistema.repository.OrcamentoRepository;
import com.sistema.repository.TipoDocumentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/documentos")
@CrossOrigin(origins = "*")
public class DocumentoController {

    @Autowired
    private DocumentoRepository documentoRepository;

    @Autowired
    private TipoDocumentoRepository tipoDocumentoRepository;

    @Autowired
    private OrcamentoRepository orcamentoRepository;

    // Endpoint para buscar documentos por orçamento
    @GetMapping("/orcamento/{orcamentoId}")
    public ResponseEntity<List<Documento>> getDocumentosPorOrcamento(@PathVariable Long orcamentoId) {
        try {
            List<Documento> documentos = documentoRepository.findByOrcamentoId(orcamentoId);
            return ResponseEntity.ok(documentos);
        } catch (Exception e) {
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    // Endpoint para upload de documento
    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocumento(
            @RequestParam("file") MultipartFile file,
            @RequestParam("tipoDocumentoId") Long tipoDocumentoId,
            @RequestParam("orcamentoId") Long orcamentoId) {
        try {
            // Validação do arquivo
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Arquivo vazio");
            }

            String fileName = file.getOriginalFilename();

            // Cria diretório se não existir
            java.nio.file.Path uploadDir = java.nio.file.Paths.get("uploads");
            java.nio.file.Files.createDirectories(uploadDir);

            // Gera nome único
            String newFileName = System.currentTimeMillis() + "_" + fileName;
            java.nio.file.Path targetLocation = uploadDir.resolve(newFileName);

            // Salva arquivo
            java.nio.file.Files.copy(file.getInputStream(), targetLocation, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            // Busca o orçamento - CORREÇÃO AQUI
            Optional<Orcamento> orcamentoOpt = orcamentoRepository.findById(orcamentoId);
            if (!orcamentoOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Orçamento não encontrado");
            }
            Orcamento orcamento = orcamentoOpt.get(); // PEGA O VALOR DO Optional

            // Busca o tipo de documento - CORREÇÃO AQUI
            Optional<TipoDocumento> tipoDocumentoOpt = tipoDocumentoRepository.findById(tipoDocumentoId);
            if (!tipoDocumentoOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Tipo de documento não encontrado");
            }
            TipoDocumento tipoDocumento = tipoDocumentoOpt.get(); // PEGA O VALOR DO Optional

            // Cria e salva documento - CORREÇÃO AQUI
            Documento documento = new Documento();
            documento.setArquivoLocal(newFileName);
            documento.setTipo(tipoDocumento); // USA O VALOR, NÃO O Optional
            documento.setOrcamento(orcamento); // USA O VALOR, NÃO O Optional

            Documento savedDocumento = documentoRepository.save(documento);
            return ResponseEntity.ok(savedDocumento);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao fazer upload: " + e.getMessage());
        }
    }

    // Endpoint para deletar
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocumento(@PathVariable Long id) {
        try {
            Optional<Documento> documentoOpt = documentoRepository.findById(id);
            if (!documentoOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Documento não encontrado");
            }

            Documento documento = documentoOpt.get();

            // Remove arquivo físico
            java.nio.file.Path filePath = java.nio.file.Paths.get("uploads").resolve(documento.getArquivoLocal());
            java.nio.file.Files.deleteIfExists(filePath);

            // Remove do banco
            documentoRepository.delete(documento);

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao excluir documento: " + e.getMessage());
        }
    }
}