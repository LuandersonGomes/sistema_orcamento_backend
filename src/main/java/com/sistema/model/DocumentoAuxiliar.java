package com.sistema.model;

import javax.persistence.*;

@Entity
@Table(name = "documentos_auxiliares")
public class DocumentoAuxiliar {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "orcamento_id")
    private Orcamento orcamento;
    
    @ManyToOne
    @JoinColumn(name = "secretaria_id")
    private Secretaria secretaria;
    
    private String boleto;
    private String licencaFinal;
    private String nc;
    private String campo4p;
    
    // getters e setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Orcamento getOrcamento() { return orcamento; }
    public void setOrcamento(Orcamento orcamento) { this.orcamento = orcamento; }
    
    public Secretaria getSecretaria() { return secretaria; }
    public void setSecretaria(Secretaria secretaria) { this.secretaria = secretaria; }
    
    public String getBoleto() { return boleto; }
    public void setBoleto(String boleto) { this.boleto = boleto; }
    
    public String getLicencaFinal() { return licencaFinal; }
    public void setLicencaFinal(String licencaFinal) { this.licencaFinal = licencaFinal; }
    
    public String getNc() { return nc; }
    public void setNc(String nc) { this.nc = nc; }
    
    public String getCampo4p() { return campo4p; }
    public void setCampo4p(String campo4p) { this.campo4p = campo4p; }
}