package com.sistema.controller;

import com.sistema.model.Documento;
import com.sistema.model.Orcamento;
import com.sistema.model.TipoDocumento;
import com.sistema.repository.DocumentoRepository;
import com.sistema.repository.OrcamentoRepository;
import com.sistema.repository.TipoDocumentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
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

    // Endpoint para buscar documento por ID
    @GetMapping("/{id}")
    public ResponseEntity<Documento> getDocumentoById(@PathVariable Long id) {
        try {
            Optional<Documento> documentoOpt = documentoRepository.findById(id);
            if (documentoOpt.isPresent()) {
                return ResponseEntity.ok(documentoOpt.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Endpoint para download de documento
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadDocumento(@PathVariable Long id) {
        try {
            // Buscar o documento no banco de dados
            Optional<Documento> documentoOpt = documentoRepository.findById(id);
            if (!documentoOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Documento documento = documentoOpt.get();
            String fileName = documento.getArquivoLocal();

            if (fileName == null || fileName.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            // Construir o caminho do arquivo
            Path uploadDir = Paths.get("uploads");
            Path filePath = uploadDir.resolve(fileName).normalize();

            // Verificar se o arquivo existe
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }

            // Carregar o recurso
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            // Determinar tipo de conteúdo
            String contentType = "application/octet-stream";
            try {
                contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    // Detecção baseada na extensão
                    String lowerFileName = fileName.toLowerCase();
                    if (lowerFileName.endsWith(".pdf")) {
                        contentType = "application/pdf";
                    } else if (lowerFileName.endsWith(".doc")) {
                        contentType = "application/msword";
                    } else if (lowerFileName.endsWith(".docx")) {
                        contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                    } else if (lowerFileName.endsWith(".jpg") || lowerFileName.endsWith(".jpeg")) {
                        contentType = "image/jpeg";
                    } else if (lowerFileName.endsWith(".png")) {
                        contentType = "image/png";
                    } else if (lowerFileName.endsWith(".txt")) {
                        contentType = "text/plain";
                    }
                }
            } catch (Exception e) {
                contentType = "application/octet-stream";
            }

            // Configurar cabeçalhos para download
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + fileName + "\"")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Endpoint para visualizar documento (inline)
    @GetMapping("/view/{id}")
    public ResponseEntity<Resource> viewDocumento(@PathVariable Long id) {
        try {
            // Buscar o documento no banco de dados
            Optional<Documento> documentoOpt = documentoRepository.findById(id);
            if (!documentoOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Documento documento = documentoOpt.get();
            String fileName = documento.getArquivoLocal();

            if (fileName == null || fileName.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            // Construir o caminho do arquivo
            Path uploadDir = Paths.get("uploads");
            Path filePath = uploadDir.resolve(fileName).normalize();

            // Verificar se o arquivo existe
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }

            // Carregar o recurso
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            // Determinar tipo de conteúdo
            String contentType = "application/octet-stream";
            try {
                contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    // Detecção baseada na extensão
                    String lowerFileName = fileName.toLowerCase();
                    if (lowerFileName.endsWith(".pdf")) {
                        contentType = "application/pdf";
                    } else if (lowerFileName.endsWith(".doc") || lowerFileName.endsWith(".docx")) {
                        contentType = "application/msword";
                    } else if (lowerFileName.endsWith(".jpg") || lowerFileName.endsWith(".jpeg")) {
                        contentType = "image/jpeg";
                    } else if (lowerFileName.endsWith(".png")) {
                        contentType = "image/png";
                    }
                }
            } catch (Exception e) {
                contentType = "application/octet-stream";
            }

            // Configurar cabeçalhos para visualização (não download)
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + fileName + "\"")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
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
            Path uploadDir = Paths.get("uploads");
            Files.createDirectories(uploadDir);

            // Gera nome único
            String newFileName = System.currentTimeMillis() + "_" + fileName;
            Path targetLocation = uploadDir.resolve(newFileName);

            // Salva arquivo
            Files.copy(file.getInputStream(), targetLocation, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            // Busca o orçamento
            Optional<Orcamento> orcamentoOpt = orcamentoRepository.findById(orcamentoId);
            if (!orcamentoOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Orçamento não encontrado");
            }
            Orcamento orcamento = orcamentoOpt.get();

            // Busca o tipo de documento
            Optional<TipoDocumento> tipoDocumentoOpt = tipoDocumentoRepository.findById(tipoDocumentoId);
            if (!tipoDocumentoOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Tipo de documento não encontrado");
            }
            TipoDocumento tipoDocumento = tipoDocumentoOpt.get();

            // Cria e salva documento
            Documento documento = new Documento();
            documento.setArquivoLocal(newFileName);
            documento.setTipo(tipoDocumento);
            documento.setOrcamento(orcamento);
            documento.setDataUpload(LocalDateTime.now());

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
            Path filePath = Paths.get("uploads").resolve(documento.getArquivoLocal());
            Files.deleteIfExists(filePath);

            // Remove do banco
            documentoRepository.delete(documento);

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao excluir documento: " + e.getMessage());
        }
    }
}