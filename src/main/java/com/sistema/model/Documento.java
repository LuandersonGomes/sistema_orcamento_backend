package com.sistema.model;

import java.time.LocalDateTime;
import javax.persistence.*;

@Entity
@Table(name = "documentos")
public class Documento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "tipo_documento_id")
    private TipoDocumento tipo;

    @Column(name = "arquivo_local")
    private String arquivoLocal;

    @ManyToOne
    @JoinColumn(name = "orcamento_id")
    private Orcamento orcamento;

    private LocalDateTime dataUpload;

    // getters e setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public TipoDocumento getTipo() { return tipo; }
    public void setTipo(TipoDocumento tipo) { this.tipo = tipo; }
    public String getArquivoLocal() { return arquivoLocal; }
    public void setArquivoLocal(String arquivoLocal) { this.arquivoLocal = arquivoLocal; }
    public Orcamento getOrcamento() { return orcamento; }
    public void setOrcamento(Orcamento orcamento) { this.orcamento = orcamento; }
    // getters e setters
    public LocalDateTime getDataUpload() {
        return dataUpload;
    }

    public void setDataUpload(LocalDateTime dataUpload) {
        this.dataUpload = dataUpload;
    }
}