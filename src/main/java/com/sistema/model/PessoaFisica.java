package com.sistema.model;

import javax.persistence.*;

@Entity
@Table(name = "pessoas_fisicas")
public class PessoaFisica {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String rg;
    
    @Column(unique = true)
    private String cpf;
    
    @Column(name = "nome_completo", nullable = false)
    private String nomeCompleto;
    
    private String endereco;
    
    @Column(name = "estado_civil")
    private String estadoCivil;
    
    private boolean notificacao = true;
    
    // getters e setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRg() { return rg; }
    public void setRg(String rg) { this.rg = rg; }
    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public String getNomeCompleto() { return nomeCompleto; }
    public void setNomeCompleto(String nomeCompleto) { this.nomeCompleto = nomeCompleto; }
    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }
    public String getEstadoCivil() { return estadoCivil; }
    public void setEstadoCivil(String estadoCivil) { this.estadoCivil = estadoCivil; }
    public boolean isNotificacao() { return notificacao; }
    public void setNotificacao(boolean notificacao) { this.notificacao = notificacao; }
}