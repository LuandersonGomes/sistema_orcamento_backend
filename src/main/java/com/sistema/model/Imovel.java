package com.sistema.model;

import javax.persistence.*;

@Entity
@Table(name = "imoveis")
public class Imovel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String lote;
    private String quadra;
    private String logradouro;
    private String matricula;
    
    @Column(name = "doc_posse")
    private String docPosse;
    
    @ManyToOne
    @JoinColumn(name = "proprietario_fisico_id")
    private PessoaFisica proprietarioFisico;
    
    @ManyToOne
    @JoinColumn(name = "proprietario_juridico_id")
    private PessoaJuridica proprietarioJuridico;
    
    // getters e setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getLote() { return lote; }
    public void setLote(String lote) { this.lote = lote; }
    public String getQuadra() { return quadra; }
    public void setQuadra(String quadra) { this.quadra = quadra; }
    public String getLogradouro() { return logradouro; }
    public void setLogradouro(String logradouro) { this.logradouro = logradouro; }
    public String getMatricula() { return matricula; }
    public void setMatricula(String matricula) { this.matricula = matricula; }
    public String getDocPosse() { return docPosse; }
    public void setDocPosse(String docPosse) { this.docPosse = docPosse; }
    public PessoaFisica getProprietarioFisico() { return proprietarioFisico; }
    public void setProprietarioFisico(PessoaFisica proprietarioFisico) { this.proprietarioFisico = proprietarioFisico; }
    public PessoaJuridica getProprietarioJuridico() { return proprietarioJuridico; }
    public void setProprietarioJuridico(PessoaJuridica proprietarioJuridico) { this.proprietarioJuridico = proprietarioJuridico; }
}