package com.sistema.model;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "checklist_documentos")
public class ChecklistDocumento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "secretaria_id")
    private Secretaria secretaria;
    
    @ManyToOne
    @JoinColumn(name = "servico_id")
    private Servico servico;
    
    @ManyToMany
    @JoinTable(
        name = "checklist_tipos_documento",
        joinColumns = @JoinColumn(name = "checklist_id"),
        inverseJoinColumns = @JoinColumn(name = "tipo_documento_id")
    )
    private List<TipoDocumento> tiposDocumentos;
    
    // getters e setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Secretaria getSecretaria() { return secretaria; }
    public void setSecretaria(Secretaria secretaria) { this.secretaria = secretaria; }
    public Servico getServico() { return servico; }
    public void setServico(Servico servico) { this.servico = servico; }
    public List<TipoDocumento> getTiposDocumentos() { return tiposDocumentos; }
    public void setTiposDocumentos(List<TipoDocumento> tiposDocumentos) { this.tiposDocumentos = tiposDocumentos; }
}