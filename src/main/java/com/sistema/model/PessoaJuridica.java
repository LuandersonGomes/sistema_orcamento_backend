package com.sistema.model;

import javax.persistence.*;

@Entity
@Table(name = "pessoas_juridicas")
public class PessoaJuridica {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String cnpj;
    
    @Column(name = "razao_social")
    private String razaoSocial;
    
    @Column(name = "nome_fantasia")
    private String nomeFantasia;
    
    @Column(name = "inscricao_estadual")
    private String inscricaoEstadual;
    
    @Column(name = "ata_constitucao")
    private String ataConstitucao;
    
    // getters e setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }
    public String getRazaoSocial() { return razaoSocial; }
    public void setRazaoSocial(String razaoSocial) { this.razaoSocial = razaoSocial; }
    public String getNomeFantasia() { return nomeFantasia; }
    public void setNomeFantasia(String nomeFantasia) { this.nomeFantasia = nomeFantasia; }
    public String getInscricaoEstadual() { return inscricaoEstadual; }
    public void setInscricaoEstadual(String inscricaoEstadual) { this.inscricaoEstadual = inscricaoEstadual; }
    public String getAtaConstitucao() { return ataConstitucao; }
    public void setAtaConstitucao(String ataConstitucao) { this.ataConstitucao = ataConstitucao; }
}